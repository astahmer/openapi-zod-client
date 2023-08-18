import type { SchemaObject, SchemasObject } from "openapi3-ts";
import { describe, expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src/generateZodClientFromOpenAPI";
import { getZodClientTemplateContext } from "../src/template-context";

const makeOpenApiDoc = (schemas: SchemasObject, responseSchema: SchemaObject) => ({
    openapi: "3.0.3",
    info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
    paths: {
        "/example": {
            get: {
                operationId: "getExample",
                responses: {
                    "200": { description: "OK", content: { "application/json": { schema: responseSchema } } },
                },
            },
        },
    },
    components: { schemas },
});

describe("export-all-types", () => {
    test("shouldExportAllTypes option, non-circular types are exported", async () => {
        const Playlist = {
            allOf: [
                {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        author: { $ref: "#/components/schemas/Author" },
                        songs: { type: "array", items: { $ref: "#/components/schemas/Song" } },
                    },
                },
                {
                    $ref: "#/components/schemas/Settings",
                },
            ],
        } as SchemaObject;

        const Song = {
            type: "object",
            properties: {
                name: { type: "string" },
                duration: { type: "number" },
            },
        } as SchemaObject;

        const Author = {
            type: "object",
            properties: {
                name: { nullable: true, oneOf: [{ type: "string", nullable: true }, { type: "number" }] },
                mail: { type: "string" },
                settings: { $ref: "#/components/schemas/Settings" },
            },
        } as SchemaObject;

        const Settings = {
            type: "object",
            properties: {
                theme_color: { type: "string" },
            },
        } as SchemaObject;
        const schemas = { Playlist, Song, Author, Settings };

        const RootSchema = {
            type: "object",
            properties: {
                playlist: { $ref: "#/components/schemas/Playlist" },
                by_author: { $ref: "#/components/schemas/Author" },
            },
        } as SchemaObject;

        const openApiDoc = makeOpenApiDoc(schemas, RootSchema);

        const data = getZodClientTemplateContext(openApiDoc, { shouldExportAllTypes: true });

        expect(data).toEqual({
            schemas: {
                Settings: "z.object({ theme_color: z.string() }).partial().passthrough()",
                Author: "z.object({ name: z.union([z.string(), z.number()]).nullable(), mail: z.string(), settings: Settings }).partial().passthrough()",
                Song: "z.object({ name: z.string(), duration: z.number() }).partial().passthrough()",
                Playlist:
                    "z.object({ name: z.string(), author: Author, songs: z.array(Song) }).partial().passthrough().and(Settings)",
            },
            endpoints: [
                {
                    method: "get",
                    path: "/example",
                    requestFormat: "json",
                    description: undefined,
                    parameters: [],
                    errors: [],
                    response: "z.object({ playlist: Playlist, by_author: Author }).partial().passthrough()",
                },
            ],
            types: {
                Author: `type Author = Partial<{
    name: (string | null) | number | null;
    mail: string;
    settings: Settings;
}>;`,
                Playlist: `type Playlist = Partial<{
    name: string;
    author: Author;
    songs: Array<Song>;
}> & Settings;`,
                Settings: `type Settings = Partial<{
    theme_color: string;
}>;`,
                Song: `type Song = Partial<{
    name: string;
    duration: number;
}>;`,
            },
            circularTypeByName: {},
            endpointsGroups: {},
            emittedType: {
                Author: true,
                Settings: true,
                Playlist: true,
                Song: true,
            },
            options: {
                withAlias: false,
                baseUrl: "",
            },
        });

        const prettyOutput = await generateZodClientFromOpenAPI({
            openApiDoc,
            disableWriteToFile: true,
            options: {
                shouldExportAllTypes: true,
            },
        });
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          type Playlist = Partial<{
            name: string;
            author: Author;
            songs: Array<Song>;
          }> &
            Settings;
          type Author = Partial<{
            name: (string | null) | number | null;
            mail: string;
            settings: Settings;
          }>;
          type Settings = Partial<{
            theme_color: string;
          }>;
          type Song = Partial<{
            name: string;
            duration: number;
          }>;

          const Settings: z.ZodType<Settings> = z
            .object({ theme_color: z.string() })
            .partial()
            .passthrough();
          const Author: z.ZodType<Author> = z
            .object({
              name: z.union([z.string(), z.number()]).nullable(),
              mail: z.string(),
              settings: Settings,
            })
            .partial()
            .passthrough();
          const Song: z.ZodType<Song> = z
            .object({ name: z.string(), duration: z.number() })
            .partial()
            .passthrough();
          const Playlist: z.ZodType<Playlist> = z
            .object({ name: z.string(), author: Author, songs: z.array(Song) })
            .partial()
            .passthrough()
            .and(Settings);

          export const schemas = {
            Settings,
            Author,
            Song,
            Playlist,
          };

          const endpoints = makeApi([
            {
              method: "get",
              path: "/example",
              requestFormat: "json",
              response: z
                .object({ playlist: Playlist, by_author: Author })
                .partial()
                .passthrough(),
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          "
        `);
    });
});
