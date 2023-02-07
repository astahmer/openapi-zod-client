import type { AwaitFn } from "pastable";

import schemaPrettier from "./schema-prettierrc.json";

const getLanguageSchemas = async () => {
    return {
        data: {
            // https://github.com/SchemaStore/schemastore/blob/1d89c46b81e34e0f6ff9914085eb2ba44808145c/src/schemas/json/prettierrc.json
            prettier: schemaPrettier,
            // https://github.com/OAI/OpenAPI-Specification/blob/157a4c81ae537ef793b2bee368bc00d88b461de8/schemas/v3.0/schema.yaml
            // commented since @monaco-editor/react isn't compatible with monaco-yaml
            // hopefully it will be fixed in the future
            // openApiV3: (await parse("./schema-openapi-v3.0.yaml")) as Omit<JSONSchema7, "$id"> & { id: string },
        },
    };
};

// eslint-disable-next-line import/no-unused-modules
export default getLanguageSchemas;

export type GetLanguageSchemasData = AwaitFn<typeof getLanguageSchemas>["data"];
