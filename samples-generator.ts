import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject } from "openapi3-ts";
import { resolveConfig } from "prettier";
import { getZodClientTemplateContext, maybePretty } from "./src/generateZodClientFromOpenAPI";

import fg from "fast-glob";

import degit from "degit";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import Handlebars from "handlebars";
import { spawnSync } from "child_process";

const emitter = degit("https://github.com/OAI/OpenAPI-Specification/examples", {
    cache: true,
    force: true,
    verbose: true,
});

emitter.on("info", (info) => {
    console.log(info.message);
});

emitter.clone("./samples").then(() => {
    console.log("done cloning samples");

    spawnSync("rm -rf ./samples/v2.0", { shell: true });
    console.log("removed v2.0 swagger samples");

    const jsonList = fg.sync(["./samples/v3\\.*/**/*.json"]);
    jsonList.forEach((jsonPath) => unlinkSync(jsonPath));

    // generateTsClients();
});

const generateTsClients = async () => {
    const prettierConfig = await resolveConfig("./");
    const list = fg.sync(["./samples/v3\\.*/**/*.yaml"]);

    const template = Handlebars.compile(readFileSync("./src/template.hbs", "utf-8"));

    for (const docPath of list) {
        try {
            const openApiDoc = (await SwaggerParser.parse(docPath)) as OpenAPIObject;
            const data = getZodClientTemplateContext(openApiDoc);

            const output = template(data);
            const prettyOutput = maybePretty(output, prettierConfig);

            writeFileSync(docPath.replace("yaml", "") + "ts", prettyOutput);
        } catch (error) {
            console.log({ docPath, error: error.message });
        }
    }

    console.log(`done generating ${list.length} clients`);
};
