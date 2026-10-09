import { fileURLToPath } from "node:url";
import type { OpenAPIObject } from "openapi3-ts";
import ts from "typescript";
import { expect, test } from "vitest";
import { z } from "zod";
import { getZodClientTemplateContext } from "../src/template-context";

function typeErrors(source: string): string[] {
    const filename = fileURLToPath(new URL("./.generated-anyOf-types.ts", import.meta.url));
    const options: ts.CompilerOptions = {
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        types: [],
    };
    const host = ts.createCompilerHost(options);
    const getSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (name, languageVersion, onError, shouldCreateNewSourceFile) =>
        name === filename
            ? ts.createSourceFile(name, source, languageVersion, true)
            : getSourceFile(name, languageVersion, onError, shouldCreateNewSourceFile);

    return ts
        .getPreEmitDiagnostics(ts.createProgram([filename], options, host))
        .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
}

test.each([false, true])("anyOf types match runtime unions (readonly: %s)", (allReadonly) => {
    const document: OpenAPIObject = {
        openapi: "3.1.0",
        info: { title: "anyOf types", version: "1" },
        paths: {},
        components: {
            schemas: {
                Status: { type: "string", enum: ["ready", 'quoted "label"', null] },
                Mixed: {
                    type: ["string", "integer", "boolean", "null"],
                    enum: ["ready", -1, 0, true, false, null],
                },
                Node: {
                    type: "object",
                    required: ["status", "mixed", "parent", "choice", "children"],
                    properties: {
                        status: { $ref: "#/components/schemas/Status" },
                        mixed: { $ref: "#/components/schemas/Mixed" },
                        parent: { anyOf: [{ $ref: "#/components/schemas/Node" }, { type: "null" }] },
                        choice: { nullable: true, anyOf: [{ type: "string" }, { type: "number" }] },
                        children: {
                            anyOf: [{ type: "array", items: { $ref: "#/components/schemas/Node" } }, { type: "null" }],
                        },
                    },
                },
            },
        },
    };
    const context = getZodClientTemplateContext(document, {
        shouldExportAllSchemas: true,
        shouldExportAllTypes: true,
        allReadonly,
    });
    // The lockfile pins Zod 3.19, before .readonly(); check readonly TypeScript separately.
    if (!allReadonly) {
        const declarations = Object.entries(context.schemas)
            .map(([name, expression]) => `const ${name} = ${expression};`)
            .join("\n");
        const schema: z.ZodTypeAny = new Function("z", `${declarations}\nreturn Node;`)(z);
        const valid = { status: "ready", mixed: -1, parent: null, choice: null, children: [] };

        expect(schema.safeParse(valid).success).toBe(true);
        expect(schema.safeParse({ ...valid, parent: valid, choice: "ready", children: [valid] }).success).toBe(true);
        expect(schema.safeParse({ ...valid, choice: 1 }).success).toBe(true);
        expect(schema.safeParse({ ...valid, parent: [valid] }).success).toBe(false);
        expect(schema.safeParse({ ...valid, choice: ["ready"] }).success).toBe(false);
        expect(schema.safeParse({ ...valid, children: valid }).success).toBe(false);
        expect(schema.safeParse({ ...valid, children: [[valid]] }).success).toBe(false);
    }

    const source = `import { z } from "zod";
${Object.values(context.types).join("\n")}
${(allReadonly ? [] : Object.entries(context.schemas))
    .map(
        ([name, expression]) =>
            `const ${name}${context.emittedType[name] ? `: z.ZodType<${name}>` : ""} = ${expression};`
    )
    .join("\n")}
const valid: Node = { status: "ready", mixed: -1, parent: null, choice: null, children: [] };
const nested: Node = { ...valid, parent: valid, choice: "ready", children: [valid] };
const numericChoice: Node = { ...valid, choice: 1 };
const statuses: Status[] = ["ready", 'quoted "label"', null];
const mixed: Mixed[] = ["ready", -1, 0, true, false, null];
// @ts-expect-error anyOf does not introduce array alternatives
const invalidParent: Node = { ...valid, parent: [valid] };
// @ts-expect-error nullable anyOf does not introduce array alternatives
const invalidChoice: Node = { ...valid, choice: ["ready"] };
// @ts-expect-error the array branch accepts arrays of nodes, not a single node
const invalidChildren: Node = { ...valid, children: valid };
// @ts-expect-error anyOf does not add another array dimension
const nestedArrays: Node = { ...valid, children: [[valid]] };
// @ts-expect-error numeric enum members are not strings
const invalidMixed: Node = { ...valid, mixed: "-1" };
${
    allReadonly
        ? "// @ts-expect-error allReadonly preserves readonly array branches\nnested.children?.push(valid);"
        : "nested.children?.push(valid);"
}
`;
    expect(typeErrors(source)).toEqual([]);
});
