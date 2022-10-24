import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import SwaggerParser from "@apidevtools/swagger-parser";
import cac from "cac";
import type { OpenAPIObject } from "openapi3-ts";
import { safeJSONParse } from "pastable/server";
import { resolveConfig } from "prettier";

import { generateZodClientFromOpenAPI } from "../src/generateZodClientFromOpenAPI";

const cli = cac("openapi-zod-client");
const packageJson = safeJSONParse(readFileSync(resolve(__dirname, "../../package.json"), "utf8"));

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
    .option("--media-type-expr <expr>", "Pass an expression to determine which response content should be allowed")
    .option("--export-schemas", "When true, will export all `#/components/schemas`")
    .option(
        "--implicit-required",
        "When true, will make all properties of an object required by default (rather than the current opposite), unless an explicitly `required` array is set"
    )
    .option("--with-deprecated", "when true, will keep deprecated endpoints in the api output")
    .option(
        "--group-strategy",
        "groups endpoints by a given strategy, possible values are: 'none' | 'tag' | 'method' | 'tag-file' | 'method-file'"
    )
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
                shouldExportAllSchemas: options.exportSchemas,
                isMediaTypeAllowed: options.mediaTypeExpr,
                withImplicitRequiredProps: options.implicitRequired,
                withDeprecatedEndpoints: options.withDeprecated,
                groupStrategy: options.groupStrategy,
            },
        });
        console.log(`Done generating <${distPath}> !`);
    });

cli.version(packageJson.version!);
cli.help();

cli.parse();
