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
import { getZodSchema } from "./openApiToZod";
import { tokens } from "./tokens";
import { topologicalSort } from "./topologicalSort";

const file = ts.createSourceFile("", "", ts.ScriptTarget.ESNext, true);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const printTs = (node: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, node, file);

export const getZodClientTemplateContext = (
    openApiDoc: GenerateZodClientFromOpenApiArgs["openApiDoc"],
    options?: TemplateContext["options"]
) => {
    const result = getZodiosEndpointDescriptionFromOpenApiDoc(openApiDoc, options);
    const data = makeInitialContext();

    const refsByCircularToken = reverse(result.circularTokenByRef) as Record<string, string>;
    const docSchemas = openApiDoc.components?.schemas || {};
    const depsGraphs = getOpenApiDependencyGraph(
        Object.keys(docSchemas).map((name) => `#/components/schemas/${name}`),
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

    if (options?.shouldExportAllSchemas) {
        Object.entries(docSchemas).map(([name, schema]) => {
            const varName = tokens.makeVar(name);
            if (!result.hashByVariableName[varName]) {
                const code = getZodSchema({ schema, ctx: result }).toString();
                const hashed = tokens.makeRefHash(code);
                result.hashByVariableName[varName] = hashed;
                result.zodSchemaByHash[hashed] = code;
            }
        });
    }

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
            errors: endpoint.errors.map((error) => ({
                ...error,
                schema: maybeReplaceTokenOrVarnameWithRef(
                    error.schema as any,
                    `${endpoint.alias}_Error_${error.status}`
                ),
            })) as any,
        });
    });
    data.endpoints = sortBy(data.endpoints, "path");

    return data;
};
type GenerateZodClientFromOpenApiArgs = {
    openApiDoc: OpenAPIObject;
    templatePath?: string;
    prettierConfig?: Options | null;
    options?: TemplateContext["options"];
} & (
    | {
          distPath?: never;
          /** when true, will only return the result rather than writing it to a file, mostly used for easier testing purpose */
          disableWriteToFile: true;
      }
    | { distPath: string; disableWriteToFile?: false }
);

export const generateZodClientFromOpenAPI = async ({
    openApiDoc,
    distPath,
    templatePath,
    prettierConfig,
    options,
    disableWriteToFile,
}: GenerateZodClientFromOpenApiArgs) => {
    const data = getZodClientTemplateContext(openApiDoc, options);

    if (!templatePath) {
        templatePath = path.join(__dirname, "../src/template.hbs");
    }
    const source = await fs.readFile(templatePath, "utf-8");
    const template = compile(source);

    const output = template({ ...data, options });
    const prettyOutput = maybePretty(output, prettierConfig);

    if (!disableWriteToFile && distPath) {
        await fs.writeFile(distPath, prettyOutput);
    }

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
        /** @see https://www.zodios.org/docs/client#baseurl */
        baseUrl?: string;
        /** @see https://www.zodios.org/docs/client#zodiosalias */
        withAlias?: boolean;
        /**
         * when defined, will be used to pick which endpoint to use as the main one and set to `ZodiosEndpointDescription["response"]`
         * will use `default` status code as fallback
         *
         * @see https://www.zodios.org/docs/api/api-definition#api-definition-structure
         *
         * works like `validateStatus` from axios
         * @see https://github.com/axios/axios#handling-errors
         *
         * @default `(200)`
         */
        isMainResponseStatus?: string | ((status: number) => boolean);
        /**
         * when defined, will be used to pick which endpoints should be included in the `ZodiosEndpointDescription["errors"]` array
         * ignores `default` status
         *
         * @see https://www.zodios.org/docs/api/api-definition#errors
         *
         * works like `validateStatus` from axios
         * @see https://github.com/axios/axios#handling-errors
         *
         * @default `!(status >= 200 && status < 300)`
         */
        isErrorStatus?: string | ((status: number) => boolean);
        /**
         * when defined, will be used to pick the first MediaType found in (ResponseObject|RequestBodyObject)["content"] map matching the given expression
         *
         * context: some APIs returns multiple media types for the same response, this option allows you to pick which one to use
         * or allows you to define a custom media type to use like `application/json-ld` or `application/vnd.api+json`) etc...
         * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#response-object
         * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#media-types
         *
         * @default `mediaType === "application/json"`
         */
        isMediaTypeAllowed?: string | ((mediaType: string) => boolean);
        /** if OperationObject["description"] is not defined but the main ResponseObject["description"] is defined, use the latter as ZodiosEndpointDescription["description"] */
        useMainResponseDescriptionAsEndpointDescriptionFallback?: boolean;
        /**
         * when true, will export all `#/components/schemas` even when not used in any PathItemObject
         * @see https://github.com/astahmer/openapi-zod-client/issues/19
         */
        shouldExportAllSchemas?: boolean;
    };
}
