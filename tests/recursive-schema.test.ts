import {
    getZodSchema,
    getZodiosEndpointDescriptionFromOpenApiDoc,
    getZodClientTemplateContext,
    ConversionTypeContext,
    getOpenApiDependencyGraph,
} from "../src";
import { test, expect, describe } from "vitest";
import { SchemaObject, SchemasObject } from "openapi3-ts";
import { maybePretty } from "../src/generateZodClientFromOpenAPI";
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
            hashByVariableName: {},
            schemaHashByRef: {},
            zodSchemaByHash: {},
            codeMetaByRef: {},
            circularTokenByRef: {},
            getSchemaByRef: (ref) => schemas[ref.split("/").at(-1)!],
        };
        expect(getZodSchema({ schema: schemas.Root, ctx })).toMatchInlineSnapshot(
            '"z.object({ recursive: @ref__vykJ2VkPu6T__, basic: z.number() }).partial()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "circularTokenByRef": {
                  "#/components/schemas/Middle": "@circular__WRZ2lBGFuo",
                  "#/components/schemas/User": "@circular__9Dvq68jEoU",
              },
              "codeMetaByRef": {
                  "#/components/schemas/Middle": "z.object({ user: @ref__vykJ2VkPu6T__ }).partial()",
                  "#/components/schemas/User": "z.object({ name: z.string(), middle: @ref__vmxC2x9xozY__ }).partial()",
              },
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/Middle": "@ref__vmxC2x9xozY__",
                  "#/components/schemas/User": "@ref__vykJ2VkPu6T__",
              },
              "zodSchemaByHash": {
                  "@ref__vmxC2x9xozY__": "z.object({ user: @ref__vykJ2VkPu6T__ }).partial()",
                  "@ref__vykJ2VkPu6T__": "z.object({ name: z.string(), middle: @circular__WRZ2lBGFuo }).partial()",
              },
          }
        `);

        const openApiDoc = makeOpenApiDoc(schemas, schemas.Root);
        const depsGraph = getOpenApiDependencyGraph(Object.keys(ctx.schemaHashByRef), ctx.getSchemaByRef);
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

        const data = getZodClientTemplateContext(openApiDoc);
        const prettierConfig = await resolveConfig("./");
        const template = compile(readFileSync("./src/template.hbs", "utf-8"));
        const output = template(data);
        const prettyOutput = maybePretty(output, prettierConfig);

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

          const vmxC2x9xozY: z.ZodType<Middle> = z.lazy(() => z.object({ user: vykJ2VkPu6T }).partial());
          const vykJ2VkPu6T: z.ZodType<User> = z.lazy(() => z.object({ name: z.string(), middle: vmxC2x9xozY }).partial());
          const vpPUiHrnAPA = z.object({ recursive: vykJ2VkPu6T, basic: z.number() }).partial();

          const variables = {
              getExample: vpPUiHrnAPA,
          };

          const endpoints = makeApi([
              {
                  method: "get",
                  path: "/example",
                  requestFormat: "json",
                  response: z.object({ recursive: variables["getExample"], basic: z.number() }).partial(),
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
            hashByVariableName: {},
            schemaHashByRef: {},
            zodSchemaByHash: {},
            codeMetaByRef: {},
            circularTokenByRef: {},
            getSchemaByRef: (ref) => schemas2[ref.split("/").at(-1)!],
        };
        expect(getZodSchema({ schema: ResponseSchema, ctx })).toMatchInlineSnapshot(
            '"z.object({ recursiveRef: @ref__vn7L9W2t8wc__, basic: z.number() }).partial()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "circularTokenByRef": {
                  "#/components/schemas/ObjectWithRecursiveArray": "@circular__CGhYUyblqx",
              },
              "codeMetaByRef": {
                  "#/components/schemas/ObjectWithRecursiveArray": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(@ref__vn7L9W2t8wc__) }).partial()",
              },
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/ObjectWithRecursiveArray": "@ref__vn7L9W2t8wc__",
              },
              "zodSchemaByHash": {
                  "@ref__vn7L9W2t8wc__": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(@circular__CGhYUyblqx) }).partial()",
              },
          }
        `);

        expect(getZodiosEndpointDescriptionFromOpenApiDoc(makeOpenApiDoc(schemas2, ResponseSchema)))
            .toMatchInlineSnapshot(`
              {
                  "circularTokenByRef": {
                      "#/components/schemas/ObjectWithRecursiveArray": "@circular__CGhYUyblqx",
                  },
                  "codeMetaByRef": {
                      "#/components/schemas/ObjectWithRecursiveArray": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(@ref__vn7L9W2t8wc__) }).partial()",
                  },
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
                          "response": "z.object({ recursiveRef: @ref__vn7L9W2t8wc__, basic: z.number() }).partial()",
                      },
                  ],
                  "getSchemaByRef": [Function],
                  "hashByVariableName": {
                      "@var/getExample": "@ref__vSafhiM9uzK__",
                  },
                  "refsDependencyGraph": {
                      "#/components/schemas/ObjectWithRecursiveArray": Set {
                          "#/components/schemas/ObjectWithRecursiveArray",
                      },
                  },
                  "responsesByOperationId": {
                      "getExample": {
                          "200": "@var/getExample",
                      },
                  },
                  "schemaHashByRef": {
                      "#/components/schemas/ObjectWithRecursiveArray": "@ref__vn7L9W2t8wc__",
                  },
                  "zodSchemaByHash": {
                      "@ref__vSafhiM9uzK__": "z.object({ recursiveRef: @ref__vn7L9W2t8wc__, basic: z.number() }).partial()",
                      "@ref__vn7L9W2t8wc__": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(@circular__CGhYUyblqx) }).partial()",
                  },
              }
            `);
    });

    test("direct recursive", () => {
        const ctx: ConversionTypeContext = {
            hashByVariableName: {},
            schemaHashByRef: {},
            zodSchemaByHash: {},
            codeMetaByRef: {},
            circularTokenByRef: {},
            getSchemaByRef: (ref) => UserSchema,
        };
        expect(getZodSchema({ schema: UserSchema, ctx })).toMatchInlineSnapshot(
            '"z.object({ name: z.string(), parent: @ref__vp9wPnKpGO4__ }).partial()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "circularTokenByRef": {
                  "#/components/schemas/User": "@circular__9Dvq68jEoU",
              },
              "codeMetaByRef": {
                  "#/components/schemas/User": "z.object({ name: z.string(), parent: @ref__vp9wPnKpGO4__ }).partial()",
              },
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/User": "@ref__vp9wPnKpGO4__",
              },
              "zodSchemaByHash": {
                  "@ref__vp9wPnKpGO4__": "z.object({ name: z.string(), parent: @circular__9Dvq68jEoU }).partial()",
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
            hashByVariableName: {},
            schemaHashByRef: {},
            zodSchemaByHash: {},
            codeMetaByRef: {},
            circularTokenByRef: {},
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
        ).toMatchInlineSnapshot('"z.object({ recursiveUser: @ref__vI2n3cIMAsJ__, basic: z.number() }).partial()"');
        expect(ctx).toMatchInlineSnapshot(`
          {
              "circularTokenByRef": {
                  "#/components/schemas/Friend": "@circular__y9ima2EJ1e",
                  "#/components/schemas/UserWithFriends": "@circular__HOpnp24BWM",
              },
              "codeMetaByRef": {
                  "#/components/schemas/Friend": "z.object({ nickname: z.string(), user: @circular__HOpnp24BWM, circle: z.array(@circular__y9ima2EJ1e) }).partial()",
                  "#/components/schemas/UserWithFriends": "z.object({ name: z.string(), parent: @ref__vI2n3cIMAsJ__, friends: z.array(@ref__vhJSpwkcvXK__), bestFriend: @ref__vhJSpwkcvXK__ }).partial()",
              },
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/Friend": "@ref__vhJSpwkcvXK__",
                  "#/components/schemas/UserWithFriends": "@ref__vI2n3cIMAsJ__",
              },
              "zodSchemaByHash": {
                  "@ref__vI2n3cIMAsJ__": "z.object({ name: z.string(), parent: @circular__HOpnp24BWM, friends: z.array(@ref__vhJSpwkcvXK__), bestFriend: @ref__vhJSpwkcvXK__ }).partial()",
                  "@ref__vhJSpwkcvXK__": "z.object({ nickname: z.string(), user: @circular__HOpnp24BWM, circle: z.array(@circular__y9ima2EJ1e) }).partial()",
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

        expect(getZodiosEndpointDescriptionFromOpenApiDoc(openApiDoc)).toMatchInlineSnapshot(`
          {
              "circularTokenByRef": {
                  "#/components/schemas/Friend": "@circular__y9ima2EJ1e",
                  "#/components/schemas/UserWithFriends": "@circular__HOpnp24BWM",
              },
              "codeMetaByRef": {
                  "#/components/schemas/Friend": "z.object({ nickname: z.string(), user: @circular__HOpnp24BWM, circle: z.array(@circular__y9ima2EJ1e) }).partial()",
                  "#/components/schemas/UserWithFriends": "z.object({ name: z.string(), parent: @ref__vI2n3cIMAsJ__, friends: z.array(@ref__vhJSpwkcvXK__), bestFriend: @ref__vhJSpwkcvXK__ }).partial()",
              },
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
                      "response": "z.object({ someUser: @ref__vI2n3cIMAsJ__, someProp: z.boolean() }).partial()",
                  },
              ],
              "getSchemaByRef": [Function],
              "hashByVariableName": {
                  "@var/getExample": "@ref__vJxvA6FpTFS__",
              },
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
              "responsesByOperationId": {
                  "getExample": {
                      "200": "@var/getExample",
                  },
              },
              "schemaHashByRef": {
                  "#/components/schemas/Friend": "@ref__vhJSpwkcvXK__",
                  "#/components/schemas/UserWithFriends": "@ref__vI2n3cIMAsJ__",
              },
              "zodSchemaByHash": {
                  "@ref__vI2n3cIMAsJ__": "z.object({ name: z.string(), parent: @circular__HOpnp24BWM, friends: z.array(@ref__vhJSpwkcvXK__), bestFriend: @ref__vhJSpwkcvXK__ }).partial()",
                  "@ref__vJxvA6FpTFS__": "z.object({ someUser: @ref__vI2n3cIMAsJ__, someProp: z.boolean() }).partial()",
                  "@ref__vhJSpwkcvXK__": "z.object({ nickname: z.string(), user: @circular__HOpnp24BWM, circle: z.array(@circular__y9ima2EJ1e) }).partial()",
              },
          }
        `);

        const templateCtx = getZodClientTemplateContext(openApiDoc);
        expect(templateCtx).toMatchInlineSnapshot(`
          {
              "endpoints": [
                  {
                      "alias": "getExample",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/example",
                      "requestFormat": "json",
                      "response": "z.object({ someUser: variables["getExample"], someProp: z.boolean() }).partial()",
                  },
              ],
              "options": {
                  "baseUrl": "",
                  "withAlias": false,
              },
              "schemas": {
                  "vI2n3cIMAsJ": "z.lazy(() => z.object({ name: z.string(), parent: vI2n3cIMAsJ, friends: z.array(vhJSpwkcvXK), bestFriend: vhJSpwkcvXK }).partial())",
                  "vJxvA6FpTFS": "z.object({ someUser: vI2n3cIMAsJ, someProp: z.boolean() }).partial()",
                  "vhJSpwkcvXK": "z.lazy(() => z.object({ nickname: z.string(), user: vI2n3cIMAsJ, circle: z.array(vhJSpwkcvXK) }).partial())",
              },
              "typeNameByRefHash": {
                  "vI2n3cIMAsJ": "UserWithFriends",
                  "vhJSpwkcvXK": "Friend",
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
              "variables": {
                  "getExample": "vJxvA6FpTFS",
              },
          }
        `);

        const data = getZodClientTemplateContext(openApiDoc);
        const prettierConfig = await resolveConfig("./");
        const template = compile(readFileSync("./src/template.hbs", "utf-8"));
        const output = template(data);
        const prettyOutput = maybePretty(output, prettierConfig);

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

          const vhJSpwkcvXK: z.ZodType<Friend> = z.lazy(() =>
              z.object({ nickname: z.string(), user: vI2n3cIMAsJ, circle: z.array(vhJSpwkcvXK) }).partial()
          );
          const vI2n3cIMAsJ: z.ZodType<UserWithFriends> = z.lazy(() =>
              z
                  .object({ name: z.string(), parent: vI2n3cIMAsJ, friends: z.array(vhJSpwkcvXK), bestFriend: vhJSpwkcvXK })
                  .partial()
          );
          const vJxvA6FpTFS = z.object({ someUser: vI2n3cIMAsJ, someProp: z.boolean() }).partial();

          const variables = {
              getExample: vJxvA6FpTFS,
          };

          const endpoints = makeApi([
              {
                  method: "get",
                  path: "/example",
                  requestFormat: "json",
                  response: z.object({ someUser: variables["getExample"], someProp: z.boolean() }).partial(),
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
            hashByVariableName: {},
            schemaHashByRef: {},
            zodSchemaByHash: {},
            codeMetaByRef: {},
            circularTokenByRef: {},
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
            '"z.object({ playlist: @ref__viFjc1kNoYx__, by_author: @ref__vNcCnlCKe5S__ }).partial()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "circularTokenByRef": {
                  "#/components/schemas/Author": "@circular__AtBhSdDVi2",
                  "#/components/schemas/Playlist": "@circular__HCGhm3ASad",
                  "#/components/schemas/Settings": "@circular__3CW414XqWI",
                  "#/components/schemas/Song": "@circular__XRX5ZO2W35",
              },
              "codeMetaByRef": {
                  "#/components/schemas/Author": "z.object({ name: z.string(), mail: z.string(), settings: @ref__v2H3fS1mWG5__ }).partial()",
                  "#/components/schemas/Playlist": "z.object({ name: z.string(), author: @ref__vNcCnlCKe5S__, songs: z.array(@ref__vJI3dWF2fZS__) }).partial()",
                  "#/components/schemas/Settings": "z.object({ theme_color: z.string() }).partial()",
                  "#/components/schemas/Song": "z.object({ name: z.string(), duration: z.number(), in_playlists: z.array(@ref__viFjc1kNoYx__) }).partial()",
              },
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/Author": "@ref__vNcCnlCKe5S__",
                  "#/components/schemas/Playlist": "@ref__viFjc1kNoYx__",
                  "#/components/schemas/Settings": "@ref__v2H3fS1mWG5__",
                  "#/components/schemas/Song": "@ref__vJI3dWF2fZS__",
              },
              "zodSchemaByHash": {
                  "@ref__v2H3fS1mWG5__": "z.object({ theme_color: z.string() }).partial()",
                  "@ref__vJI3dWF2fZS__": "z.object({ name: z.string(), duration: z.number(), in_playlists: z.array(@ref__viFjc1kNoYx__) }).partial()",
                  "@ref__vNcCnlCKe5S__": "z.object({ name: z.string(), mail: z.string(), settings: @ref__v2H3fS1mWG5__ }).partial()",
                  "@ref__viFjc1kNoYx__": "z.object({ name: z.string(), author: @ref__vNcCnlCKe5S__, songs: z.array(@circular__XRX5ZO2W35) }).partial()",
              },
          }
        `);

        const openApiDoc = makeOpenApiDoc(schemas, RootSchema);
        const data = getZodClientTemplateContext(openApiDoc);
        const prettierConfig = await resolveConfig("./");
        const template = compile(readFileSync("./src/template.hbs", "utf-8"));
        const output = template(data);
        const prettyOutput = maybePretty(output, prettierConfig);
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

          const v2H3fS1mWG5 = z.object({ theme_color: z.string() }).partial();
          const vNcCnlCKe5S = z.object({ name: z.string(), mail: z.string(), settings: v2H3fS1mWG5 }).partial();
          const vJI3dWF2fZS: z.ZodType<Song> = z.lazy(() =>
              z.object({ name: z.string(), duration: z.number(), in_playlists: z.array(viFjc1kNoYx) }).partial()
          );
          const viFjc1kNoYx: z.ZodType<Playlist> = z.lazy(() =>
              z.object({ name: z.string(), author: vNcCnlCKe5S, songs: z.array(vJI3dWF2fZS) }).partial()
          );
          const vDYmM7qpXBP = z.object({ playlist: viFjc1kNoYx, by_author: vNcCnlCKe5S }).partial();

          const variables = {
              getExample: vDYmM7qpXBP,
          };

          const endpoints = makeApi([
              {
                  method: "get",
                  path: "/example",
                  requestFormat: "json",
                  response: z.object({ playlist: variables["getExample"], by_author: variables["getExample"] }).partial(),
              },
          ]);

          export const api = new Zodios(endpoints);
          "
        `);
    });
});
