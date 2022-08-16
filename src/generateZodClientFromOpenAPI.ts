import Handlebars from "handlebars";
import fs from "node:fs/promises";
import { OpenAPIObject } from "openapi3-ts";
import { reverse, sortBy, sortObjectKeys, sortObjKeysFromArray, uniques } from "pastable/server";
import prettier, { Options } from "prettier";
import parserTypescript from "prettier/parser-typescript";
import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
import {
    EndpointDescriptionWithRefs,
    getZodiosEndpointDescriptionFromOpenApiDoc,
} from "./getZodiosEndpointDescriptionFromOpenApiDoc";
import { tokens } from "./tokens";
import { topologicalSort } from "./topologicalSort";

export const getZodClientTemplateContext = (openApiDoc: GenerateZodClientFromOpenApiArgs["openApiDoc"]) => {
    const result = getZodiosEndpointDescriptionFromOpenApiDoc(openApiDoc);
    const data = makeInitialContext();

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

    for (const refHash in result.zodSchemaByHash) {
        data.schemas[tokens.rmToken(refHash, tokens.refToken)] = replaceRefTokenWithVariableRef(
            result.zodSchemaByHash[refHash]
        );
    }
    const dependencyGraph = getOpenApiDependencyGraph(
        Object.keys(openApiDoc.components?.schemas || {}).map((name) => `#/components/schemas/${name}`),
        result.getSchemaByRef
    );
    const schemaOrderedByDependencies = uniques(
        topologicalSort(dependencyGraph)
            .filter((ref) => result.zodSchemaByHash[result.schemaHashByRef[ref]])
            .map((ref) => tokens.rmToken(result.schemaHashByRef[ref], tokens.refToken))
    );
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
}

export const generateZodClientFromOpenAPI = async ({
    openApiDoc,
    distPath,
    templatePath = "./src/template.hbs",
    prettierConfig,
}: GenerateZodClientFromOpenApiArgs) => {
    const data = getZodClientTemplateContext(openApiDoc);

    const source = await fs.readFile(templatePath, "utf-8");
    const template = Handlebars.compile(source);

    const output = template(data);
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
        options: {
            withAlias: false,
        },
    } as TemplateContext);

interface TemplateContext {
    variables: Record<string, string>;
    schemas: Record<string, string>;
    endpoints: EndpointDescriptionWithRefs[];
    options?: {
        withAlias?: boolean;
    };
}
