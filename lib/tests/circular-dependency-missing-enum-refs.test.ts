import type { SchemaObject, SchemasObject } from "openapi3-ts";
import { describe, expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src/generateZodClientFromOpenAPI";

describe("circular-dependency-missing-enum-refs", () => {
    test("should generate enum dependencies with proper type annotations when circular schemas use z.lazy", async () => {
        // - CircularA references CircularB (circular dependency)
        // - CircularA also references enum Status which should get proper type annotation
        const schemas: SchemasObject = {
            CircularA: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    status: { $ref: "#/components/schemas/Status" },
                    circularB: { $ref: "#/components/schemas/CircularB" }
                }
            } as SchemaObject,

            CircularB: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    circularA: { $ref: "#/components/schemas/CircularA" }
                }
            } as SchemaObject,

            Status: {
                type: "string",
                enum: ["active", "inactive"]
            }
        };

        const openApiDoc = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/test": {
                    get: {
                        operationId: "getTest",
                        responses: {
                            "200": {
                                description: "OK",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/CircularA" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: { schemas }
        };

        const output = await generateZodClientFromOpenAPI({
            openApiDoc,
            disableWriteToFile: true
        });

        // enum dependencies of circular schemas should get proper type annotations (: z.ZodType<...>):
        expect(output).toContain("const Status: z.ZodType<Status> = z.enum");

        // Circular schemas should also have type annotations, but that was already the case:
        expect(output).toContain("const CircularA: z.ZodType<CircularA> = z.lazy");
        expect(output).toContain("const CircularB: z.ZodType<CircularB> = z.lazy");
    });
});

