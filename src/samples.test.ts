import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject } from "openapi3-ts";
import { Options, resolveConfig } from "prettier";
import { getZodClientTemplateContext, maybePretty } from "./generateZodClientFromOpenAPI";

import fg from "fast-glob";

import { readFileSync } from "fs";
import Handlebars from "handlebars";
import { beforeAll, describe, expect, test } from "vitest";

let prettierConfig: Options | null;

beforeAll(async () => {
    prettierConfig = await resolveConfig("./");
});

describe("samples-generator", async () => {
    const list = fg.sync(["./samples/v3\\.*/**/*.yaml"]);

    const template = Handlebars.compile(readFileSync("./src/template.hbs", "utf-8"));
    const resultByFile = {} as Record<string, string>;

    for (const docPath of list) {
        test(docPath, async () => {
            const openApiDoc = (await SwaggerParser.parse(docPath)) as OpenAPIObject;
            const data = getZodClientTemplateContext(openApiDoc);

            const output = template(data);
            const prettyOutput = maybePretty(output, prettierConfig);
            const fileName = docPath.replace("yaml", "");

            // means the .ts file is valid
            expect(prettyOutput).not.toBe(output);

            // means the input format doesn't matter (json=yaml) -> same .ts
            if (resultByFile[fileName]) {
                expect(resultByFile[fileName]).toEqual(prettyOutput);
            }

            expect(prettyOutput).toMatchSnapshot();

            resultByFile[fileName] = prettyOutput;
        });
    }
});
