import Handlebars from "handlebars";
import fs from "node:fs/promises";
import { OpenAPIObject } from "openapi3-ts";
import { sortBy, sortObjectKeys } from "pastable/server";
import prettier, { Options } from "prettier";
import parserTypescript from "prettier/parser-typescript";
import {
    EndpointDescriptionWithRefs,
    getZodiosEndpointDescriptionFromOpenApiDoc,
} from "./getZodiosEndpointDescriptionFromOpenApiDoc";
import { tokens } from "./tokens";

export const getZodClientTemplateContext = ({ openApiDoc }: Pick<GenerateZodClientFromOpenApiArgs, "openApiDoc">) => {
    const result = getZodiosEndpointDescriptionFromOpenApiDoc(openApiDoc);
    const data = { ...initialContext };

    for (const variableRef in result.hashByVariableName) {
        const value = result.hashByVariableName[variableRef];
        data.schemas[tokens.rmTokenAlias(variableRef, tokens.varAlias)] =
            value[0] === "#" ? result.schemaHashByRef[value] : value;
    }
    data.schemas = sortObjectKeys(data.schemas);

    result.endpoints.forEach((endpoint) => {
        if (!endpoint.response) return;
        data.endpoints.push({
            ...endpoint,
            parameters: endpoint.parameters.map((param) => ({
                ...param,
                schema: tokens.isTokenAlias(param.schema, tokens.varAlias)
                    ? `schemas["${tokens.rmTokenAlias(param.schema, tokens.varAlias)}"]`
                    : param.schema,
            })),
            response: tokens.isTokenAlias(endpoint.response, tokens.varAlias)
                ? `schemas["${tokens.rmTokenAlias(endpoint.response, tokens.varAlias)}"]`
                : endpoint.response[0] === "#"
                ? result.schemaHashByRef[endpoint.response]
                : endpoint.response,
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
    const data = getZodClientTemplateContext({ openApiDoc });

    const source = await fs.readFile(templatePath, "utf-8");
    const template = Handlebars.compile(source);

    const output = template(data);
    const prettyOutput = maybePretty(output, prettierConfig);

    await fs.writeFile(distPath, prettyOutput);

    return prettyOutput;
};

/** @see https://github.dev/stephenh/ts-poet/blob/5ea0dbb3c9f1f4b0ee51a54abb2d758102eda4a2/src/Code.ts#L231 */
function maybePretty(input: string, options?: Options | null): string {
    try {
        return prettier.format(input.trim(), { parser: "typescript", plugins: [parserTypescript], ...options });
    } catch (e) {
        return input; // assume it's invalid syntax and ignore
    }
}

const initialContext: TemplateContext = {
    schemas: {},
    endpoints: [],
    options: {
        withAlias: false,
    },
};

interface TemplateContext {
    schemas: Record<string, string>;
    endpoints: EndpointDescriptionWithRefs[];
    options?: {
        withAlias?: boolean;
    };
}
