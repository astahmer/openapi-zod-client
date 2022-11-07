import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIObject } from "openapi3-ts";
import { Options, resolveConfig } from "prettier";
import { getZodClientTemplateContext } from "../src/template-context";
import { getHandlebars } from "../src/getHandlebars";
import { maybePretty } from "../src/maybePretty";

import fg from "fast-glob";

import { readFileSync } from "node:fs";
import * as path from "node:path";
import { beforeAll, describe, expect, test } from "vitest";

let prettierConfig: Options | null;
const pkgRoot = process.cwd();

beforeAll(async () => {
    console.log({ prettierConfigPath: path.resolve(pkgRoot, "../") });
    prettierConfig = await resolveConfig(path.resolve(pkgRoot, "../"));
    console.log({ prettierConfig });
});

describe("samples-generator", async () => {
    const samplesPath = path.resolve(pkgRoot, "../", "./samples/v3\\.*/**/*.yaml");
    const list = fg.sync([samplesPath]);
    console.log({ samplesPath, list, cwd: process.cwd(), url: import.meta.url });

    const template = getHandlebars().compile(readFileSync("./src/templates/default.hbs", "utf8"));
    const resultByFile = {} as Record<string, string>;

    for (const docPath of list) {
        test(docPath, async () => {
            const openApiDoc = (await SwaggerParser.parse(docPath)) as OpenAPIObject;
            const data = getZodClientTemplateContext(openApiDoc);

            const output = template({ ...data, options: { ...data.options, apiClientName: "api" } });
            console.log({ openApiDoc, data, output });
            const prettyOutput = maybePretty(output, prettierConfig);
            const fileName = docPath.replace("yaml", "");

            // means the .ts file is valid
            expect(prettyOutput).not.toBe(output);

            // means the input format doesn't matter (json=yaml) -> same .ts
            if (resultByFile[fileName]) {
                expect(resultByFile[fileName]).toEqual(prettyOutput);
            }

            console.log(resultByFile[fileName], prettyOutput);
            expect(prettyOutput).toMatchSnapshot();

            resultByFile[fileName] = prettyOutput;
        });
    }
});
