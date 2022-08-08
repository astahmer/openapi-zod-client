import Handlebars from "handlebars";
import fs from "node:fs/promises";
import { OpenAPIObject } from "openapi3-ts";
import { sortBy, sortObjectKeys } from "pastable/server";
import prettier, { Options } from "prettier";
import parserTypescript from "prettier/parser-typescript";
import { isVarAlias, rmVarAlias } from "./openApiToZod";
import {
    EndpointDescriptionWithRefs,
    getZodiosEndpointDescriptionFromOpenApiDoc,
} from "./getZodiosEndpointDescriptionFromOpenApiDoc";

export const getZodClientTemplateContext = ({ openApiDoc }: Pick<GenerateZodClientFromOpenApiArgs, "openApiDoc">) => {
    const result = getZodiosEndpointDescriptionFromOpenApiDoc(openApiDoc);

    const data = { ...initialContext };

    for (const variableRef in result.variables) {
        const value = result.variables[variableRef];
        data.schemas[rmVarAlias(variableRef)] = value[0] === "#" ? result.refs[value] : value;
    }
    data.schemas = sortObjectKeys(data.schemas);

    result.endpoints.forEach((endpoint) => {
        data.endpoints.push({
            ...endpoint,
            parameters: endpoint.parameters.map((param) => ({
                ...param,
                schema: isVarAlias(param.schema) ? `schemas["${rmVarAlias(param.schema)}"]` : param.schema,
            })),
            response: `schemas["${rmVarAlias(endpoint.response)}"]`,
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
