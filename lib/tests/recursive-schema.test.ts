import type { SchemaObject, SchemasObject } from "openapi3-ts";
import { describe, expect, test } from "vitest";
import {
    getOpenApiDependencyGraph,
    getZodClientTemplateContext,
    getZodiosEndpointDefinitionList,
    getZodSchema,
} from "../src";
import { generateZodClientFromOpenAPI } from "../src/generateZodClientFromOpenAPI";
import { topologicalSort } from "../src/topologicalSort";
import type { ConversionTypeContext } from "../src/CodeMeta";
import { makeSchemaResolver } from "../src/makeSchemaResolver";
import { asComponentSchema } from "../src/utils";

// TODO recursive inline response/param ?

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

describe("recursive-schema", () => {
    const UserSchema = {
        type: "object",
        properties: {
            name: { type: "string" },
            parent: { $ref: "#/components/schemas/User" },
        },
    } as SchemaObject;

    test("indirect single recursive", async () => {
        const schemas = {
            User: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    middle: { $ref: "#/components/schemas/Middle" },
                },
            },
            Middle: {
                type: "object",
                properties: {
                    user: { $ref: "#/components/schemas/User" },
                },
            },
            Root: {
                type: "object",
                properties: {
                    recursive: {
                        $ref: "#/components/schemas/User",
                    },
                    basic: { type: "number" },
                },
            },
        } as SchemasObject;
        const ctx: ConversionTypeContext = {
            zodSchemaByName: {},
            schemaByName: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        expect(getZodSchema({ schema: schemas.Root, ctx })).toMatchInlineSnapshot(
            '"z.object({ recursive: User, basic: z.number() }).partial().passthrough()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "resolver": {
                  "getSchemaByRef": [Function],
                  "resolveRef": [Function],
                  "resolveSchemaName": [Function],
              },
              "schemaByName": {},
              "zodSchemaByName": {
                  "Middle": "z.object({ user: User }).partial().passthrough()",
                  "User": "z.object({ name: z.string(), middle: Middle }).partial().passthrough()",
              },
          }
        `);

        const openApiDoc = makeOpenApiDoc(schemas, schemas.Root);
        const depsGraph = getOpenApiDependencyGraph(
            Object.keys(ctx.zodSchemaByName).map((name) => asComponentSchema(name)),
            ctx.resolver.getSchemaByRef
        );
        expect(depsGraph).toMatchInlineSnapshot(`
          {
              "deepDependencyGraph": {
                  "#/components/schemas/Middle": Set {
                      "#/components/schemas/User",
                      "#/components/schemas/Middle",
                  },
                  "#/components/schemas/User": Set {
                      "#/components/schemas/Middle",
                      "#/components/schemas/User",
                  },
              },
              "refsDependencyGraph": {
                  "#/components/schemas/Middle": Set {
                      "#/components/schemas/User",
                  },
                  "#/components/schemas/User": Set {
                      "#/components/schemas/Middle",
                  },
              },
          }
        `);

        expect(topologicalSort(depsGraph.refsDependencyGraph)).toMatchInlineSnapshot(`
          [
              "#/components/schemas/User",
              "#/components/schemas/Middle",
          ]
        `);

        const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          type User = Partial<{
            name: string;
            middle: Middle;
          }>;
          type Middle = Partial<{
            user: User;
          }>;

          const Middle: z.ZodType<Middle> = z.lazy(() =>
            z.object({ user: User }).partial().passthrough()
          );
          const User: z.ZodType<User> = z.lazy(() =>
            z.object({ name: z.string(), middle: Middle }).partial().passthrough()
          );

          export const schemas = {
            Middle,
            User,
          };

          const endpoints = makeApi([
            {
              method: "get",
              path: "/example",
              requestFormat: "json",
              response: z
                .object({ recursive: User, basic: z.number() })
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

    const ObjectWithRecursiveArray = {
        type: "object",
        properties: {
            isInsideObjectWithRecursiveArray: { type: "boolean" },
            array: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/ObjectWithRecursiveArray",
                },
            },
        },
    } as SchemaObject;
    const schemas2 = { ObjectWithRecursiveArray };
    const ResponseSchema = {
        type: "object",
        properties: {
            recursiveRef: {
                $ref: "#/components/schemas/ObjectWithRecursiveArray",
            },
            basic: { type: "number" },
        },
    } as SchemaObject;

    test("recursive array", () => {
        const ctx: ConversionTypeContext = {
            zodSchemaByName: {},
            schemaByName: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        expect(getZodSchema({ schema: ResponseSchema, ctx })).toMatchInlineSnapshot(
            '"z.object({ recursiveRef: ObjectWithRecursiveArray, basic: z.number() }).partial().passthrough()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "resolver": {
                  "getSchemaByRef": [Function],
                  "resolveRef": [Function],
                  "resolveSchemaName": [Function],
              },
              "schemaByName": {},
              "zodSchemaByName": {
                  "ObjectWithRecursiveArray": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(ObjectWithRecursiveArray) }).partial().passthrough()",
              },
          }
        `);

        expect(getZodiosEndpointDefinitionList(makeOpenApiDoc(schemas2, ResponseSchema))).toMatchInlineSnapshot(`
          {
              "deepDependencyGraph": {
                  "#/components/schemas/ObjectWithRecursiveArray": Set {
                      "#/components/schemas/ObjectWithRecursiveArray",
                  },
              },
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/example",
                      "requestFormat": "json",
                      "response": "z.object({ recursiveRef: ObjectWithRecursiveArray, basic: z.number() }).partial().passthrough()",
                  },
              ],
              "issues": {
                  "ignoredFallbackResponse": [],
                  "ignoredGenericError": [],
              },
              "refsDependencyGraph": {
                  "#/components/schemas/ObjectWithRecursiveArray": Set {
                      "#/components/schemas/ObjectWithRecursiveArray",
                  },
              },
              "resolver": {
                  "getSchemaByRef": [Function],
                  "resolveRef": [Function],
                  "resolveSchemaName": [Function],
              },
              "schemaByName": {},
              "zodSchemaByName": {
                  "ObjectWithRecursiveArray": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(ObjectWithRecursiveArray) }).partial().passthrough()",
              },
          }
        `);
    });

    test("direct recursive", () => {
        const ctx: ConversionTypeContext = {
            zodSchemaByName: {},
            schemaByName: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        expect(getZodSchema({ schema: UserSchema, ctx })).toMatchInlineSnapshot(
            '"z.object({ name: z.string(), parent: User }).partial().passthrough()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "resolver": {
                  "getSchemaByRef": [Function],
                  "resolveRef": [Function],
                  "resolveSchemaName": [Function],
              },
              "schemaByName": {},
              "zodSchemaByName": {
                  "User": "z.object({ name: z.string(), parent: User }).partial().passthrough()",
              },
          }
        `);
    });

    const UserWithFriends = {
        type: "object",
        properties: {
            name: { type: "string" },
            parent: { $ref: "#/components/schemas/UserWithFriends" },
            friends: { type: "array", items: { $ref: "#/components/schemas/Friend" } },
            bestFriend: { $ref: "#/components/schemas/Friend" },
        },
    } as SchemaObject;

    const Friend = {
        type: "object",
        properties: {
            nickname: { type: "string" },
            user: { $ref: "#/components/schemas/UserWithFriends" },
            circle: { type: "array", items: { $ref: "#/components/schemas/Friend" } },
        },
    } as SchemaObject;
    const schemas = { User: UserSchema, UserWithFriends, Friend, ResponseSchema, ObjectWithRecursiveArray };

    test("multiple recursive in one root schema", async () => {
        const ctx: ConversionTypeContext = {
            zodSchemaByName: {},
            schemaByName: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        expect(
            getZodSchema({
                schema: {
                    type: "object",
                    properties: {
                        recursiveUser: {
                            $ref: "#/components/schemas/UserWithFriends",
                        },
                        basic: { type: "number" },
                    },
                },
                ctx,
            })
        ).toMatchInlineSnapshot(
            '"z.object({ recursiveUser: UserWithFriends, basic: z.number() }).partial().passthrough()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "resolver": {
                  "getSchemaByRef": [Function],
                  "resolveRef": [Function],
                  "resolveSchemaName": [Function],
              },
              "schemaByName": {},
              "zodSchemaByName": {
                  "Friend": "z.object({ nickname: z.string(), user: UserWithFriends, circle: z.array(Friend) }).partial().passthrough()",
                  "UserWithFriends": "z.object({ name: z.string(), parent: UserWithFriends, friends: z.array(Friend), bestFriend: Friend }).partial().passthrough()",
              },
          }
        `);

        const openApiDoc = makeOpenApiDoc(schemas, {
            type: "object",
            properties: {
                someUser: {
                    $ref: "#/components/schemas/UserWithFriends",
                },
                someProp: { type: "boolean" },
            },
        });
        expect(getZodiosEndpointDefinitionList(openApiDoc)).toMatchInlineSnapshot(`
          {
              "deepDependencyGraph": {
                  "#/components/schemas/Friend": Set {
                      "#/components/schemas/UserWithFriends",
                      "#/components/schemas/Friend",
                  },
                  "#/components/schemas/ObjectWithRecursiveArray": Set {
                      "#/components/schemas/ObjectWithRecursiveArray",
                  },
                  "#/components/schemas/ResponseSchema": Set {
                      "#/components/schemas/ObjectWithRecursiveArray",
                  },
                  "#/components/schemas/User": Set {
                      "#/components/schemas/User",
                  },
                  "#/components/schemas/UserWithFriends": Set {
                      "#/components/schemas/UserWithFriends",
                      "#/components/schemas/Friend",
                  },
              },
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/example",
                      "requestFormat": "json",
                      "response": "z.object({ someUser: UserWithFriends, someProp: z.boolean() }).partial().passthrough()",
                  },
              ],
              "issues": {
                  "ignoredFallbackResponse": [],
                  "ignoredGenericError": [],
              },
              "refsDependencyGraph": {
                  "#/components/schemas/Friend": Set {
                      "#/components/schemas/UserWithFriends",
                      "#/components/schemas/Friend",
                  },
                  "#/components/schemas/ObjectWithRecursiveArray": Set {
                      "#/components/schemas/ObjectWithRecursiveArray",
                  },
                  "#/components/schemas/ResponseSchema": Set {
                      "#/components/schemas/ObjectWithRecursiveArray",
                  },
                  "#/components/schemas/User": Set {
                      "#/components/schemas/User",
                  },
                  "#/components/schemas/UserWithFriends": Set {
                      "#/components/schemas/UserWithFriends",
                      "#/components/schemas/Friend",
                  },
              },
              "resolver": {
                  "getSchemaByRef": [Function],
                  "resolveRef": [Function],
                  "resolveSchemaName": [Function],
              },
              "schemaByName": {},
              "zodSchemaByName": {
                  "Friend": "z.object({ nickname: z.string(), user: UserWithFriends, circle: z.array(Friend) }).partial().passthrough()",
                  "UserWithFriends": "z.object({ name: z.string(), parent: UserWithFriends, friends: z.array(Friend), bestFriend: Friend }).partial().passthrough()",
              },
          }
        `);

        const templateCtx = getZodClientTemplateContext(openApiDoc);
        expect(templateCtx).toMatchInlineSnapshot(`
          {
              "circularTypeByName": {
                  "Friend": true,
                  "UserWithFriends": true,
              },
              "emittedType": {
                  "Friend": true,
                  "ObjectWithRecursiveArray": true,
                  "User": true,
                  "UserWithFriends": true,
              },
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/example",
                      "requestFormat": "json",
                      "response": "z.object({ someUser: UserWithFriends, someProp: z.boolean() }).partial().passthrough()",
                  },
              ],
              "endpointsGroups": {},
              "options": {
                  "baseUrl": "",
                  "withAlias": false,
              },
              "schemas": {
                  "Friend": "z.lazy(() => z.object({ nickname: z.string(), user: UserWithFriends, circle: z.array(Friend) }).partial().passthrough())",
                  "UserWithFriends": "z.lazy(() => z.object({ name: z.string(), parent: UserWithFriends, friends: z.array(Friend), bestFriend: Friend }).partial().passthrough())",
              },
              "types": {
                  "Friend": "type Friend = Partial<{
              nickname: string;
              user: UserWithFriends;
              circle: Array<Friend>;
          }>;",
                  "ObjectWithRecursiveArray": "type ObjectWithRecursiveArray = Partial<{
              isInsideObjectWithRecursiveArray: boolean;
              array: Array<ObjectWithRecursiveArray>;
          }>;",
                  "User": "type User = Partial<{
              name: string;
              parent: User;
          }>;",
                  "UserWithFriends": "type UserWithFriends = Partial<{
              name: string;
              parent: UserWithFriends;
              friends: Array<Friend>;
              bestFriend: Friend;
          }>;",
              },
          }
        `);

        const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          type User = Partial<{
            name: string;
            parent: User;
          }>;
          type UserWithFriends = Partial<{
            name: string;
            parent: UserWithFriends;
            friends: Array<Friend>;
            bestFriend: Friend;
          }>;
          type Friend = Partial<{
            nickname: string;
            user: UserWithFriends;
            circle: Array<Friend>;
          }>;
          type ObjectWithRecursiveArray = Partial<{
            isInsideObjectWithRecursiveArray: boolean;
            array: Array<ObjectWithRecursiveArray>;
          }>;

          const Friend: z.ZodType<Friend> = z.lazy(() =>
            z
              .object({
                nickname: z.string(),
                user: UserWithFriends,
                circle: z.array(Friend),
              })
              .partial()
              .passthrough()
          );
          const UserWithFriends: z.ZodType<UserWithFriends> = z.lazy(() =>
            z
              .object({
                name: z.string(),
                parent: UserWithFriends,
                friends: z.array(Friend),
                bestFriend: Friend,
              })
              .partial()
              .passthrough()
          );

          export const schemas = {
            Friend,
            UserWithFriends,
          };

          const endpoints = makeApi([
            {
              method: "get",
              path: "/example",
              requestFormat: "json",
              response: z
                .object({ someUser: UserWithFriends, someProp: z.boolean() })
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

    test("recursive schema with $ref to another simple schema should still generate and output that simple schema and its dependencies", async () => {
        const Playlist = {
            type: "object",
            properties: {
                name: { type: "string" },
                author: { $ref: "#/components/schemas/Author" },
                songs: { type: "array", items: { $ref: "#/components/schemas/Song" } },
            },
        } as SchemaObject;

        const Song = {
            type: "object",
            properties: {
                name: { type: "string" },
                duration: { type: "number" },
                in_playlists: { type: "array", items: { $ref: "#/components/schemas/Playlist" } },
            },
        } as SchemaObject;

        const Author = {
            type: "object",
            properties: {
                name: { type: "string" },
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

        const ctx: ConversionTypeContext = {
            zodSchemaByName: {},
            schemaByName: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));

        const RootSchema = {
            type: "object",
            properties: {
                playlist: { $ref: "#/components/schemas/Playlist" },
                by_author: { $ref: "#/components/schemas/Author" },
            },
        } as SchemaObject;
        expect(getZodSchema({ schema: RootSchema, ctx })).toMatchInlineSnapshot(
            '"z.object({ playlist: Playlist, by_author: Author }).partial().passthrough()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "resolver": {
                  "getSchemaByRef": [Function],
                  "resolveRef": [Function],
                  "resolveSchemaName": [Function],
              },
              "schemaByName": {},
              "zodSchemaByName": {
                  "Author": "z.object({ name: z.string(), mail: z.string(), settings: Settings }).partial().passthrough()",
                  "Playlist": "z.object({ name: z.string(), author: Author, songs: z.array(Song) }).partial().passthrough()",
                  "Settings": "z.object({ theme_color: z.string() }).partial().passthrough()",
                  "Song": "z.object({ name: z.string(), duration: z.number(), in_playlists: z.array(Playlist) }).partial().passthrough()",
              },
          }
        `);

        const openApiDoc = makeOpenApiDoc(schemas, RootSchema);
        const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          type Playlist = Partial<{
            name: string;
            author: Author;
            songs: Array<Song>;
          }>;
          type Author = Partial<{
            name: string;
            mail: string;
            settings: Settings;
          }>;
          type Settings = Partial<{
            theme_color: string;
          }>;
          type Song = Partial<{
            name: string;
            duration: number;
            in_playlists: Array<Playlist>;
          }>;

          const Settings = z.object({ theme_color: z.string() }).partial().passthrough();
          const Author = z
            .object({ name: z.string(), mail: z.string(), settings: Settings })
            .partial()
            .passthrough();
          const Song: z.ZodType<Song> = z.lazy(() =>
            z
              .object({
                name: z.string(),
                duration: z.number(),
                in_playlists: z.array(Playlist),
              })
              .partial()
              .passthrough()
          );
          const Playlist: z.ZodType<Playlist> = z.lazy(() =>
            z
              .object({ name: z.string(), author: Author, songs: z.array(Song) })
              .partial()
              .passthrough()
          );

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
