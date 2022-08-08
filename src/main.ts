import { load as loadYaml } from "js-yaml";
import fs from "node:fs/promises";
import { getPath, OpenAPIObject, SchemaObject } from "openapi3-ts";
import { get } from "pastable/server";
import { getZodiosEndpointDescriptionFromOpenApiDoc, openApiSchemaToZodSchemaCodeString } from "./openApiToZod";

const main1 = async () => {
    const doc = (await loadYaml(await fs.readFile("./src/bff.yaml", "utf-8"))) as OpenAPIObject;
    console.log(doc);

    // const getStockValueExport = getPath(doc.paths, "/api/v1/stock-value/search/export")!;

    const getSchemaFromRef = (ref: string) => get(doc, ref.replace("#/", "").replaceAll("/", ".")) as SchemaObject;

    const pathItem = getPath(doc.paths, "/api/v1/stock-pictures/search")!;
    const schema = getSchemaFromRef(pathItem.post?.responses["200"]["content"]["application/json"].schema["$ref"]);

    // console.log(data);
    // const result = generate({ sourceText: getTransformedTs(ts) });
    // // console.log(result.getZodSchemasFile("./schema"));
    // const variables = [...result.statements.keys()];
    // console.log(variables);
    // console.log(generateZodSchemaVariableStatement({}));
};

const main2 = async () => {
    // const yaml = await loadYaml(await fs.readFile("./src/bff.yaml", "utf-8"))
    const code = openApiSchemaToZodSchemaCodeString({
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
                                requestId: {
                                    type: "string",
                                },
                                apiRequestId: {
                                    type: "string",
                                },
                                apiId: {
                                    oneOf: [
                                        {
                                            type: "string",
                                            enum: ["APIS__PERFECO"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__PARAMETHOR"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__MASTERDATA"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__MASTERFI"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__MASTERPRICE"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__DEPORTED_STOCK"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__STOCK_REPORTING"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__STORES_RETURN"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__STORES_WRITEDOWN"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__STORES_INTERNAL_CONSUMPTION"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__STORES_PACKAGE"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__STOCK_INTERSTORE"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__STOCK_RECEPTION"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__DECASTORE"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__MYOFFER"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__OMS_STORE"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__VOLGA"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__STOCK_PICTURE"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__ABNORMAL_MARGIN"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__IDENTITY"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__IDENTITY_DELEGATED"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["APIS__ADDRESS"],
                                        },
                                    ],
                                },
                                method: {
                                    oneOf: [
                                        {
                                            type: "string",
                                            enum: ["get"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["post"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["put"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["delete"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["patch"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["options"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["head"],
                                        },
                                        {
                                            type: "string",
                                            enum: ["all"],
                                        },
                                    ],
                                },
                                url: {
                                    type: "string",
                                },
                                lang: {
                                    type: "string",
                                },
                                data: {
                                    nullable: true,
                                },
                                params: {
                                    nullable: true,
                                },
                                queryParams: {
                                    nullable: true,
                                },
                            },
                            required: ["requestId", "apiRequestId", "apiId", "method", "url", "lang"],
                        },
                        time: {
                            type: "string",
                        },
                    },
                    required: ["id", "namespace", "data", "time"],
                },
            },
            totalElements: {
                type: "number",
            },
            totalPages: {
                type: "number",
            },
        },
        required: ["content", "totalElements", "totalPages"],
    });
    console.log(code);
};

const main = async () => {
    const doc = (await loadYaml(await fs.readFile("./src/bff.yaml", "utf-8"))) as OpenAPIObject;
    // console.log(doc);
    const result = getZodiosEndpointDescriptionFromOpenApiDoc(doc);
    console.log(result);
    await fs.writeFile("./src/output-zodios-withRefs.json", JSON.stringify(result, null, 4));
};

main();

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
