import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIObject } from "openapi3-ts/oas31";
import { resolveConfig } from "prettier";
import { generateZodClientFromOpenAPI } from "openapi-zod-client";

const main = async () => {
    const openApiDoc = (await SwaggerParser.parse("../petstore.yaml")) as OpenAPIObject;
    const prettierConfig = await resolveConfig("./");
    const result = await generateZodClientFromOpenAPI({
        openApiDoc,
        distPath: "./petstore-client.ts",
        prettierConfig,
    });
    console.log(result);
};

main();
