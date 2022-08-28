import { compile } from "handlebars";
import fs from "node:fs/promises";
import path from "node:path";
import { OpenAPIObject } from "openapi3-ts";
import { reverse, sortBy, sortObjectKeys, sortObjKeysFromArray } from "pastable/server";
import prettier, { Options } from "prettier";
import parserTypescript from "prettier/parser-typescript";
import { ts } from "tanu";
import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
import {
    EndpointDescriptionWithRefs,
    getZodiosEndpointDescriptionFromOpenApiDoc,
} from "./getZodiosEndpointDescriptionFromOpenApiDoc";
import { getTypescriptFromOpenApi, TsConversionContext } from "./openApiToTypescript";
import { tokens } from "./tokens";
import { topologicalSort } from "./topologicalSort";

const file = ts.createSourceFile("", "", ts.ScriptTarget.ESNext, true);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const printTs = (node: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, node, file);

export const getZodClientTemplateContext = (openApiDoc: GenerateZodClientFromOpenApiArgs["openApiDoc"]) => {
    const result = getZodiosEndpointDescriptionFromOpenApiDoc(openApiDoc);
    const data = makeInitialContext();

    const refsByCircularToken = reverse(result.circularTokenByRef) as Record<string, string>;
    const depsGraphs = getOpenApiDependencyGraph(
        Object.keys(openApiDoc.components?.schemas || {}).map((name) => `#/components/schemas/${name}`),
        result.getSchemaByRef
    );

    const replaceCircularTokenWithRefToken = (refHash: string) => {
        const [code, ref] = [result.zodSchemaByHash[refHash], refByHash[refHash]];
        const isCircular = ref && depsGraphs.deepDependencyGraph[ref]?.has(ref);
        const actualCode = isCircular ? `z.lazy(() => ${code})` : code;

        if (isCircular) {
            const refName = tokens.getRefName(ref);
            data.typeNameByRefHash[tokens.rmToken(refHash, tokens.refToken)] = refName;
        }

        return actualCode.replaceAll(tokens.circularRefRegex, (match) => {
            return result.schemaHashByRef[refsByCircularToken[match]];
        });
    };
    const replaceRefTokenWithVariableRef = (code: string) =>
        code.replaceAll(tokens.refTokenHashRegex, (match) => tokens.rmToken(match, tokens.refToken));

    const varNameByHashRef = reverse(result.hashByVariableName) as Record<string, string>;
    const maybeReplaceTokenOrVarnameWithRef = (unknownRef: string, fallbackVarName?: string): string => {
        if (unknownRef.includes(tokens.refToken)) {
            return unknownRef.replaceAll(tokens.refTokenHashRegex, (match) => {
                const varNameWithToken = varNameByHashRef[match];
                if (!varNameWithToken) {
                    return `variables["${fallbackVarName}"]`;
                }

                return `variables["${tokens.rmToken(varNameByHashRef[match], tokens.varPrefix)}"]`;
            });
        }
        if (tokens.isToken(unknownRef, tokens.varPrefix)) {
            return `variables["${tokens.rmToken(unknownRef, tokens.varPrefix)}"]`;
        }

        if (unknownRef[0] === "#") {
            return result.schemaHashByRef[unknownRef];
        }

        return unknownRef;
    };

    const refByHash = reverse(result.schemaHashByRef) as Record<string, string>;
    for (const refHash in result.zodSchemaByHash) {
        data.schemas[tokens.rmToken(refHash, tokens.refToken)] = replaceRefTokenWithVariableRef(
            replaceCircularTokenWithRefToken(refHash)
        );
    }

    for (const ref in result.circularTokenByRef) {
        const isCircular = ref && depsGraphs.deepDependencyGraph[ref]?.has(ref);
        const ctx: TsConversionContext = { nodeByRef: {}, getSchemaByRef: result.getSchemaByRef, visitedsRefs: {} };

        const refName = isCircular ? tokens.getRefName(ref) : undefined;
        if (isCircular && refName && !data.types[refName]) {
            const node = getTypescriptFromOpenApi({
                schema: result.getSchemaByRef(ref),
                ctx,
                meta: { name: refName },
            }) as ts.Node;
            data.types[refName] = printTs(node).replace("export ", "");

            for (const depRef of depsGraphs.deepDependencyGraph[ref] || []) {
                const depRefName = tokens.getRefName(depRef);
                const isDepCircular = depsGraphs.deepDependencyGraph[depRef]?.has(depRef);

                if (!isDepCircular && !data.types[depRefName]) {
                    const node = getTypescriptFromOpenApi({
                        schema: result.getSchemaByRef(depRef),
                        ctx,
                        meta: { name: depRefName },
                    }) as ts.Node;
                    data.types[depRefName] = printTs(node).replace("export ", "");
                }
            }
        }
    }

    const schemaOrderedByDependencies = topologicalSort(depsGraphs.refsDependencyGraph)
        .filter((ref) => result.zodSchemaByHash[result.schemaHashByRef[ref]])
        .map((ref) => tokens.rmToken(result.schemaHashByRef[ref], tokens.refToken));
    data.schemas = sortObjKeysFromArray(data.schemas, schemaOrderedByDependencies);

    for (const variableRef in result.hashByVariableName) {
        data.variables[tokens.rmToken(variableRef, tokens.varPrefix)] = tokens.rmToken(
            result.hashByVariableName[variableRef],
            tokens.refToken
        );
    }
    data.variables = sortObjectKeys(data.variables);

    result.endpoints.forEach((endpoint) => {
        if (!endpoint.response) return;
        data.endpoints.push({
            ...endpoint,
            parameters: endpoint.parameters.map((param) => ({
                ...param,
                schema: maybeReplaceTokenOrVarnameWithRef(param.schema),
            })),
            response: maybeReplaceTokenOrVarnameWithRef(endpoint.response, endpoint.alias),
        });
    });
    data.endpoints = sortBy(data.endpoints, "path");

    return data;
};

interface GenerateZodClientFromOpenApiArgs {
    openApiDoc: OpenAPIObject;
    distPath: string;
    templatePath?: string;
    prettierConfig?: Options | null;
    options?: TemplateContext["options"];
}

export const generateZodClientFromOpenAPI = async ({
    openApiDoc,
    distPath,
    templatePath,
    prettierConfig,
    options,
}: GenerateZodClientFromOpenApiArgs) => {
    const data = getZodClientTemplateContext(openApiDoc);

    if (!templatePath) {
        templatePath = path.join(__dirname, "../src/template.hbs");
    }
    const source = await fs.readFile(templatePath, "utf-8");
    const template = compile(source);

    const output = template({ ...data, options });
    const prettyOutput = maybePretty(output, prettierConfig);

    await fs.writeFile(distPath, prettyOutput);

    return prettyOutput;
};

/** @see https://github.dev/stephenh/ts-poet/blob/5ea0dbb3c9f1f4b0ee51a54abb2d758102eda4a2/src/Code.ts#L231 */
export function maybePretty(input: string, options?: Options | null): string {
    try {
        return prettier.format(input.trim(), { parser: "typescript", plugins: [parserTypescript], ...options });
    } catch (e) {
        return input; // assume it's invalid syntax and ignore
    }
}

const makeInitialContext = () =>
    ({
        variables: {},
        schemas: {},
        endpoints: [],
        types: {},
        typeNameByRefHash: {},
        options: {
            withAlias: false,
            baseUrl: "",
        },
    } as TemplateContext);

export interface TemplateContext {
    variables: Record<string, string>;
    schemas: Record<string, string>;
    endpoints: EndpointDescriptionWithRefs[];
    types: Record<string, string>;
    typeNameByRefHash: Record<string, string>;
    options?: {
        baseUrl?: string;
        withAlias?: boolean;
    };
}
