import {
    getZodSchema,
    getZodiosEndpointDefinitionFromOpenApiDoc,
    getZodClientTemplateContext,
    ConversionTypeContext,
    getOpenApiDependencyGraph,
} from "../src";
import { test, expect, describe } from "vitest";
import { SchemaObject, SchemasObject } from "openapi3-ts";
import { generateZodClientFromOpenAPI, maybePretty } from "../src/generateZodClientFromOpenAPI";
import { resolveConfig } from "prettier";
import { readFileSync } from "fs";
import { compile } from "handlebars";
import { topologicalSort } from "../src/topologicalSort";

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
            getSchemaByRef: (ref) => schemas[ref.split("/").at(-1)!],
        };
        expect(getZodSchema({ schema: schemas.Root, ctx })).toMatchInlineSnapshot(
            '"z.object({ recursive: User, basic: z.number() }).partial()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "getSchemaByRef": [Function],
              "zodSchemaByName": {
                  "Middle": "z.object({ user: User }).partial()",
                  "User": "z.object({ name: z.string(), middle: Middle }).partial()",
              },
          }
        `);

        const openApiDoc = makeOpenApiDoc(schemas, schemas.Root);
        const depsGraph = getOpenApiDependencyGraph(
            Object.keys(ctx.zodSchemaByName).map((name) => `#/components/schemas/${name}`),
            ctx.getSchemaByRef
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
              "#/components/schemas/Middle",
              "#/components/schemas/User",
          ]
        `);

        const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { makeApi, Zodios } from "@zodios/core";
          import { z } from "zod";

          type User = Partial<{
            name: string;
            middle: Middle;
          }>;
          type Middle = Partial<{
            user: User;
          }>;

          const Middle: z.ZodType<Middle> = z.lazy(() =>
            z.object({ user: User }).partial()
          );
          const User: z.ZodType<User> = z.lazy(() =>
            z.object({ name: z.string(), middle: Middle }).partial()
          );

          const endpoints = makeApi([
            {
              method: "get",
              path: "/example",
              requestFormat: "json",
              response: z.object({ recursive: User, basic: z.number() }).partial(),
            },
          ]);

          export const api = new Zodios(endpoints);
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
            getSchemaByRef: (ref) => schemas2[ref.split("/").at(-1)!],
        };
        expect(getZodSchema({ schema: ResponseSchema, ctx })).toMatchInlineSnapshot(
            '"z.object({ recursiveRef: ObjectWithRecursiveArray, basic: z.number() }).partial()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "getSchemaByRef": [Function],
              "zodSchemaByName": {
                  "ObjectWithRecursiveArray": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(ObjectWithRecursiveArray) }).partial()",
              },
          }
        `);

        expect(getZodiosEndpointDefinitionFromOpenApiDoc(makeOpenApiDoc(schemas2, ResponseSchema)))
            .toMatchInlineSnapshot(`
              {
                  "deepDependencyGraph": {
                      "#/components/schemas/ObjectWithRecursiveArray": Set {
                          "#/components/schemas/ObjectWithRecursiveArray",
                      },
                  },
                  "endpoints": [
                      {
                          "alias": "getExample",
                          "description": undefined,
                          "errors": [],
                          "method": "get",
                          "parameters": [],
                          "path": "/example",
                          "requestFormat": "json",
                          "response": "z.object({ recursiveRef: ObjectWithRecursiveArray, basic: z.number() }).partial()",
                      },
                  ],
                  "getSchemaByRef": [Function],
                  "refsDependencyGraph": {
                      "#/components/schemas/ObjectWithRecursiveArray": Set {
                          "#/components/schemas/ObjectWithRecursiveArray",
                      },
                  },
                  "zodSchemaByName": {
                      "ObjectWithRecursiveArray": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(ObjectWithRecursiveArray) }).partial()",
                  },
              }
            `);
    });

    test("direct recursive", () => {
        const ctx: ConversionTypeContext = {
            zodSchemaByName: {},
            getSchemaByRef: (ref) => UserSchema,
        };
        expect(getZodSchema({ schema: UserSchema, ctx })).toMatchInlineSnapshot(
            '"z.object({ name: z.string(), parent: User }).partial()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "getSchemaByRef": [Function],
              "zodSchemaByName": {
                  "User": "z.object({ name: z.string(), parent: User }).partial()",
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
    const schemas = { UserWithFriends, Friend };

    test("multiple recursive in one root schema", async () => {
        const ctx: ConversionTypeContext = {
            zodSchemaByName: {},
            getSchemaByRef: (ref: string) => schemas[ref.replace("#/components/schemas/", "")],
        };
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
        ).toMatchInlineSnapshot('"z.object({ recursiveUser: UserWithFriends, basic: z.number() }).partial()"');
        expect(ctx).toMatchInlineSnapshot(`
          {
              "getSchemaByRef": [Function],
              "zodSchemaByName": {
                  "Friend": "z.object({ nickname: z.string(), user: UserWithFriends, circle: z.array(Friend) }).partial()",
                  "UserWithFriends": "z.object({ name: z.string(), parent: UserWithFriends, friends: z.array(Friend), bestFriend: Friend }).partial()",
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

        expect(getZodiosEndpointDefinitionFromOpenApiDoc(openApiDoc)).toMatchInlineSnapshot(`
          {
              "deepDependencyGraph": {
                  "#/components/schemas/Friend": Set {
                      "#/components/schemas/UserWithFriends",
                      "#/components/schemas/Friend",
                  },
                  "#/components/schemas/UserWithFriends": Set {
                      "#/components/schemas/UserWithFriends",
                      "#/components/schemas/Friend",
                  },
              },
              "endpoints": [
                  {
                      "alias": "getExample",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/example",
                      "requestFormat": "json",
                      "response": "z.object({ someUser: UserWithFriends, someProp: z.boolean() }).partial()",
                  },
              ],
              "getSchemaByRef": [Function],
              "refsDependencyGraph": {
                  "#/components/schemas/Friend": Set {
                      "#/components/schemas/UserWithFriends",
                      "#/components/schemas/Friend",
                  },
                  "#/components/schemas/UserWithFriends": Set {
                      "#/components/schemas/UserWithFriends",
                      "#/components/schemas/Friend",
                  },
              },
              "zodSchemaByName": {
                  "Friend": "z.object({ nickname: z.string(), user: UserWithFriends, circle: z.array(Friend) }).partial()",
                  "UserWithFriends": "z.object({ name: z.string(), parent: UserWithFriends, friends: z.array(Friend), bestFriend: Friend }).partial()",
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
              "endpoints": [
                  {
                      "alias": "getExample",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/example",
                      "requestFormat": "json",
                      "response": "z.object({ someUser: UserWithFriends, someProp: z.boolean() }).partial()",
                  },
              ],
              "endpointsGroups": {},
              "options": {
                  "baseUrl": "",
                  "withAlias": false,
              },
              "schemas": {
                  "Friend": "z.lazy(() => z.object({ nickname: z.string(), user: UserWithFriends, circle: z.array(Friend) }).partial())",
                  "UserWithFriends": "z.lazy(() => z.object({ name: z.string(), parent: UserWithFriends, friends: z.array(Friend), bestFriend: Friend }).partial())",
              },
              "types": {
                  "Friend": "type Friend = Partial<{
              nickname: string;
              user: UserWithFriends;
              circle: Array<Friend>;
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
          "import { makeApi, Zodios } from "@zodios/core";
          import { z } from "zod";

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

          const Friend: z.ZodType<Friend> = z.lazy(() =>
            z
              .object({
                nickname: z.string(),
                user: UserWithFriends,
                circle: z.array(Friend),
              })
              .partial()
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
          );

          const endpoints = makeApi([
            {
              method: "get",
              path: "/example",
              requestFormat: "json",
              response: z
                .object({ someUser: UserWithFriends, someProp: z.boolean() })
                .partial(),
            },
          ]);

          export const api = new Zodios(endpoints);
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
            getSchemaByRef: (ref) => schemas[ref.split("/").at(-1)!],
        };

        const RootSchema = {
            type: "object",
            properties: {
                playlist: { $ref: "#/components/schemas/Playlist" },
                by_author: { $ref: "#/components/schemas/Author" },
            },
        } as SchemaObject;
        expect(getZodSchema({ schema: RootSchema, ctx })).toMatchInlineSnapshot(
            '"z.object({ playlist: Playlist, by_author: Author }).partial()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "getSchemaByRef": [Function],
              "zodSchemaByName": {
                  "Author": "z.object({ name: z.string(), mail: z.string(), settings: Settings }).partial()",
                  "Playlist": "z.object({ name: z.string(), author: Author, songs: z.array(Song) }).partial()",
                  "Settings": "z.object({ theme_color: z.string() }).partial()",
                  "Song": "z.object({ name: z.string(), duration: z.number(), in_playlists: z.array(Playlist) }).partial()",
              },
          }
        `);

        const openApiDoc = makeOpenApiDoc(schemas, RootSchema);
        const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { makeApi, Zodios } from "@zodios/core";
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

          const Settings = z.object({ theme_color: z.string() }).partial();
          const Author = z
            .object({ name: z.string(), mail: z.string(), settings: Settings })
            .partial();
          const Song: z.ZodType<Song> = z.lazy(() =>
            z
              .object({
                name: z.string(),
                duration: z.number(),
                in_playlists: z.array(Playlist),
              })
              .partial()
          );
          const Playlist: z.ZodType<Playlist> = z.lazy(() =>
            z.object({ name: z.string(), author: Author, songs: z.array(Song) }).partial()
          );

          const endpoints = makeApi([
            {
              method: "get",
              path: "/example",
              requestFormat: "json",
              response: z.object({ playlist: Playlist, by_author: Author }).partial(),
            },
          ]);

          export const api = new Zodios(endpoints);
          "
        `);
    });
});
