import { ZodiosEndpointDescription } from "@zodios/core";
import Handlebars from "handlebars";
import { load as loadYaml } from "js-yaml";
import fs from "node:fs/promises";
import { OpenAPIObject, SchemaObject } from "openapi3-ts";
import { sortBy, sortObjectKeys } from "pastable/server";
import prettier, { resolveConfig } from "prettier";
import parserTypescript from "prettier/parser-typescript";
import { getZodiosEndpointDescriptionFromOpenApiDoc, getZodSchema } from "./openApiToZod";

const schema = {
    type: "object",
    properties: {
        content: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                    },
                    namespace: {
                        type: "string",
                    },
                    data: {
                        type: "object",
                        properties: {
                            sixth: {
                                type: "object",
                                properties: {
                                    seventh: {
                                        type: "number",
                                    },
                                },
                            },
                        },
                    },
                },
                required: ["id", "namespace", "data", "time"],
            },
        },
    },
    required: ["content", "totalElements", "totalPages"],
} as SchemaObject;

const main2 = async () => {
    const code = getZodSchema({ schema });
    console.log(code);
    console.log(code.toString());
};

const main3 = async () => {
    const doc = (await loadYaml(await fs.readFile("./src/bff.yaml", "utf-8"))) as OpenAPIObject;
    // console.log(doc);
    const result = getZodiosEndpointDescriptionFromOpenApiDoc(doc);
    // console.log(result);
    await fs.writeFile("./src/output-zodios-withRefs.json", JSON.stringify(result, null, 4));
};

const main4 = async () => {
    const oui = getZodSchema({
        schema: {
            type: "object",
            properties: {
                nested: {
                    type: "object",
                    properties: {
                        aaa: {
                            type: "string",
                        },
                    },
                },
            },
        },
    });
};

const main5 = async () => {
    const doc = (await loadYaml(await fs.readFile("./src/bff.yaml", "utf-8"))) as OpenAPIObject;

    // console.log(doc);
    const result = getZodiosEndpointDescriptionFromOpenApiDoc(doc);
    // console.log(result);

    interface TemplateContext {
        schemas: Record<string, string>;
        endpoints: ZodiosEndpointDescription<any>[];
    }

    const data: TemplateContext = {
        schemas: {},
        endpoints: [],
    };
    for (const variableRef in result.variables) {
        const value = result.variables[variableRef];
        data.schemas[variableRef.replace("@var/", "")] = value[0] === "#" ? result.refs[value] : value;
    }
    data.schemas = sortObjectKeys(data.schemas);

    result.endpoints.forEach((endpoint) => {
        data.endpoints.push({
            ...endpoint,
            parameters: endpoint.parameters.map((param) => ({
                ...param,
                schema: param.schema.startsWith("@var/")
                    ? `schemas["${param.schema.replace("@var/", "")}"]`
                    : param.schema,
            })),
            response: `schemas["${endpoint.response.replace("@var/", "")}"]`,
        } as any);
    });
    data.endpoints = sortBy(data.endpoints, "path");

    console.log(data.endpoints);
    await fs.writeFile("./src/output-template.json", JSON.stringify(data, null, 4));
    const source = await fs.readFile("./src/template.hbs", "utf-8");
    const template = Handlebars.compile(source);
    const output = template(data);
    const prettierConfig = await resolveConfig?.("./");

    await fs.writeFile(
        "./src/output-client.ts",
        prettier.format(output.trim(), { parser: "typescript", plugins: [parserTypescript], ...prettierConfig })
    );
};

main5();

// const writeJson = <Data = any>(filePath: string, data: Data) =>
//   fs.writeFile(filePath, JSON.stringify(data, null, 4));
// const readJson = async <Data = any>(filePath: string) =>
//   JSON.parse(await fs.readFile(filePath, "utf-8")) as Data;

function normalizeString(text: string) {
    // console.log(text);
    return text
        .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .trim() // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, "_") // Replace spaces with _
        .replace(/-+/g, "_") // Replace - with _
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}
