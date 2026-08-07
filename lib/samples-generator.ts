import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject } from "openapi3-ts/oas31";
import { generateZodClientFromOpenAPI } from "./src/generateZodClientFromOpenAPI";

import fg from "fast-glob";

import degit from "degit";
import { unlinkSync, writeFileSync } from "fs";
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
    const list = fg.sync(["./samples/v3\\.*/**/*.yaml"]);

    for (const docPath of list) {
        try {
            const openApiDoc = (await SwaggerParser.parse(docPath)) as OpenAPIObject;
            const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });

            writeFileSync(docPath.replace("yaml", "") + "ts", prettyOutput);
        } catch (error) {
            console.log({ docPath, error: error.message });
        }
    }

    console.log(`done generating ${list.length} clients`);
};
