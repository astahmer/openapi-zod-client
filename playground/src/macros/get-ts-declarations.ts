import fs from "node:fs";
import path from "node:path";

import { safeJSONParse } from "pastable";
import { rollup } from "rollup";
import dts from "rollup-plugin-dts";
import type { PackageJson } from "type-fest";

const getDeps = (pkg: PackageJson) =>
    Object.keys(pkg.dependencies ?? {}).concat(Object.keys(pkg.peerDependencies ?? {}));

const getPkg = async (name: string) =>
    safeJSONParse<PackageJson>(await fs.promises.readFile(`./node_modules/${name}/package.json`, "utf8"));

const getTypesDeclaration = async (name: string) => {
    const pkg = await getPkg(name);
    if (!pkg.types && !pkg.typings) return;

    const types = (pkg.types ?? pkg.typings)!;

    const bundle = await rollup({
        input: path.resolve("./node_modules/", name, types),
        plugins: [dts({ respectExternal: true })],
        external: (id) => getDeps(pkg).includes(id),
    });
    const result = await bundle.generate({});

    return result.output[0].code;
};

const getTsDeclarations = async () => {
    const declarations = await Promise.all([getTypesDeclaration("@zodios/core"), getTypesDeclaration("zod")]);

    return {
        data: [
            { name: "@zodios/core", code: `declare module '@zodios/core' { ${declarations[0]} }` },
            { name: "zod", code: `declare module 'zod' { ${declarations[1]} }` },
        ],
    };
};

// eslint-disable-next-line import/no-unused-modules
export default getTsDeclarations;

// uncomment to run with tsx
// await getTsDeclarations();
