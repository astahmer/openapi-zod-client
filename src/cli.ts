import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject } from "openapi3-ts";
import { resolveConfig } from "prettier";
import { generateZodClientFromOpenAPI } from "../src/generateZodClientFromOpenAPI";
import cac from "cac";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import type { PackageJson } from "type-fest";
import { safeJSONParse } from "pastable/server";

const cli = cac("openapi-zod-client");
const packageJson = safeJSONParse(readFileSync(resolve(__dirname, "../../package.json"), "utf-8")) as PackageJson;

cli.command("<input>", "path/url to OpenAPI/Swagger document as json/yaml")
    .option("-o, --output <path>", "Output path for the zodios api client ts file (defaults to `<input>.client.ts`)")
    .option(
        "-t, --template <path>",
        "Template path for the handlebars template that will be used to generate the output"
    )
    .option("-p, --prettier <path>", "Prettier config path that will be used to format the output client file")
    .option("-b, --base-url <url>", "Base url for the api")
    .option("-a, --with-alias", "With alias as api client methods")
    .option("--error-expr <expr>", "Pass an expression to determine if a response status is an error")
    .option("--success-expr <expr>", "Pass an expression to determine which response status is the main success status")
    .action(async (input, options) => {
        console.log("Retrieving OpenAPI document from", input);
        const openApiDoc = (await SwaggerParser.bundle(input)) as OpenAPIObject;
        const prettierConfig = await resolveConfig(options.prettier || "./");
        const distPath = options.output || input + ".client.ts";

        await generateZodClientFromOpenAPI({
            openApiDoc,
            distPath,
            prettierConfig,
            templatePath: options.template,
            options: {
                withAlias: options.withAlias,
                baseUrl: options.baseUrl,
                isErrorStatus: options.errorExpr,
                isMainResponseStatus: options.successExpr,
            },
        });
        console.log(`Done generating <${distPath}> !`);
    });

cli.version(packageJson.version!);
cli.help();

cli.parse();
