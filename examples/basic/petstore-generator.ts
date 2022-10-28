import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject } from "openapi3-ts";
import { resolveConfig } from "prettier";
import { generateZodClientFromOpenAPI } from "../src/generateZodClientFromOpenAPI";

const main = async () => {
    const openApiDoc = (await SwaggerParser.parse("./example/petstore.yaml")) as OpenAPIObject;
    const prettierConfig = await resolveConfig("./");
    const result = await generateZodClientFromOpenAPI({
        openApiDoc,
        distPath: "./example/petstore-client.ts",
        prettierConfig,
    });
    console.log(result);
};

main();
