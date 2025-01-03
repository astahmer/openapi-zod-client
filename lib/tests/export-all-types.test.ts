import type { SchemaObject, SchemasObject } from "openapi3-ts/oas31";
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

        const Title = {
            type: "string",
            minLength: 1,
            maxLength: 30,
        } as SchemaObject;

        const Id = {
            type: "number",
        } as SchemaObject;

        const Features = {
            type: "array",
            items: {
                type: "string",
            },
            minItems: 1,
        } as SchemaObject;

        const Author = {
            type: "object",
            properties: {
                name: { nullable: true, oneOf: [{ type: "string", nullable: true }, { type: "number" }] },
                title: {
                    $ref: "#/components/schemas/Title",
                },
                id: {
                    $ref: "#/components/schemas/Id",
                },
                mail: { type: "string" },
                settings: { $ref: "#/components/schemas/Settings" },
            },
        } as SchemaObject;

        const Settings = {
            type: "object",
            properties: {
                theme_color: { type: "string" },
                features: {
                    $ref: "#/components/schemas/Features",
                },
            },
        } as SchemaObject;
        const schemas = { Playlist, Song, Author, Settings, Title, Id, Features };

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
                Settings: "z.object({ theme_color: z.string(), features: Features.min(1) }).partial().passthrough()",
                Author: "z.object({ name: z.union([z.string(), z.number()]).nullable(), title: Title.min(1).max(30), id: Id, mail: z.string(), settings: Settings }).partial().passthrough()",
                Features: "z.array(z.string())",
                Song: "z.object({ name: z.string(), duration: z.number() }).partial().passthrough()",
                Playlist:
                    "z.object({ name: z.string(), author: Author, songs: z.array(Song) }).partial().passthrough().and(Settings)",
                Title: "z.string()",
                Id: "z.number()",
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
    title: Title;
    id: Id;
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
    features: Features;
}>;`,
                Song: `type Song = Partial<{
    name: string;
    duration: number;
}>;`,
                Features: "type Features = Array<string>;",
                Id: "type Id = number;",
                Title: "type Title = string;",
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
            title: Title;
            id: Id;
            mail: string;
            settings: Settings;
          }>;
          type Title = string;
          type Id = number;
          type Settings = Partial<{
            theme_color: string;
            features: Features;
          }>;
          type Features = Array<string>;
          type Song = Partial<{
            name: string;
            duration: number;
          }>;

          const Title = z.string();
          const Id = z.number();
          const Features = z.array(z.string());
          const Settings: z.ZodType<Settings> = z
            .object({ theme_color: z.string(), features: Features.min(1) })
            .partial()
            .passthrough();
          const Author: z.ZodType<Author> = z
            .object({
              name: z.union([z.string(), z.number()]).nullable(),
              title: Title.min(1).max(30),
              id: Id,
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
            Title,
            Id,
            Features,
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
