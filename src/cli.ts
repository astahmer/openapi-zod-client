import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject } from "openapi3-ts";
import { resolveConfig } from "prettier";
import { generateZodClientFromOpenAPI } from "../src/generateZodClientFromOpenAPI";
import cac from "cac";

const cli = cac("OpenAPI zod client");

cli.command("<input> path", "OpenAPI/Swagger document as json/yaml")
    .option("-o, --output <path>", "Output path for the zodios api client ts file")
    .option(
        "-t, --template <path>",
        "Template path for the handlebars template that will be used to generate the output"
    )
    .option("-p, --prettier <path>", "Prettier config path that will be used to format the output client file")
    .action(async (input, options) => {
        console.log("Retrieving OpenAPI document from", input);
        const openApiDoc = (await SwaggerParser.parse(input)) as OpenAPIObject;
        const prettierConfig = await resolveConfig(options.prettier || "./");
        await generateZodClientFromOpenAPI({
            openApiDoc,
            distPath: options.output,
            prettierConfig,
            templatePath: options.template,
        });
        console.log("Done !");
    });

cli.parse();
