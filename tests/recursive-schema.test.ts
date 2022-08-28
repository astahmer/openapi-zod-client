import {
    getZodSchema,
    getZodiosEndpointDescriptionFromOpenApiDoc,
    getZodClientTemplateContext,
    ConversionTypeContext,
    getOpenApiDependencyGraph,
} from "../src";
import { test, expect, describe } from "vitest";
import { OpenAPIObject, SchemaObject, SchemasObject } from "openapi3-ts";
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
            '"z.object({ recursive: @ref__vPFevjJ7LUI__, basic: z.number() }).partial().optional()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "circularTokenByRef": {
                  "#/components/schemas/Middle": "@circular__WRZ2lBGFuo",
                  "#/components/schemas/User": "@circular__9Dvq68jEoU",
              },
              "codeMetaByRef": {
                  "#/components/schemas/Middle": "z.object({ user: @ref__vPFevjJ7LUI__ }).partial().optional()",
                  "#/components/schemas/User": "z.object({ name: z.string(), middle: @ref__vnviF02o8Tu__ }).partial().optional()",
              },
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/Middle": "@ref__vnviF02o8Tu__",
                  "#/components/schemas/User": "@ref__vPFevjJ7LUI__",
              },
              "zodSchemaByHash": {
                  "@ref__vPFevjJ7LUI__": "z.object({ name: z.string(), middle: @circular__WRZ2lBGFuo }).partial().optional()",
                  "@ref__vnviF02o8Tu__": "z.object({ user: @ref__vPFevjJ7LUI__ }).partial().optional()",
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
          "import { Zodios } from "@zodios/core";
          import { z } from "zod";

          type User = Partial<{
              name: string;
              middle: Middle;
          }>;
          type Middle = Partial<{
              user: User;
          }>;

          const vnviF02o8Tu: z.ZodType<Middle> = z.lazy(() => z.object({ user: vPFevjJ7LUI }).partial().optional());
          const vPFevjJ7LUI: z.ZodType<User> = z.lazy(() =>
              z.object({ name: z.string(), middle: vnviF02o8Tu }).partial().optional()
          );
          const v6rtFDPUihu = z.object({ recursive: vPFevjJ7LUI, basic: z.number() }).partial();

          const variables = {
              getExample: v6rtFDPUihu,
          };

          const endpoints = [
              {
                  method: "get",
                  path: "/example",
                  requestFormat: "json",
                  response: z.object({ recursive: variables["getExample"], basic: z.number() }).partial(),
              },
          ] as const;

          export const api = new Zodios("__baseurl__", endpoints);
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
            '"z.object({ recursiveRef: @ref__vH6ZnJ3y9YI__, basic: z.number() }).partial().optional()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "circularTokenByRef": {
                  "#/components/schemas/ObjectWithRecursiveArray": "@circular__CGhYUyblqx",
              },
              "codeMetaByRef": {
                  "#/components/schemas/ObjectWithRecursiveArray": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(@ref__vH6ZnJ3y9YI__) }).partial().optional()",
              },
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/ObjectWithRecursiveArray": "@ref__vH6ZnJ3y9YI__",
              },
              "zodSchemaByHash": {
                  "@ref__vH6ZnJ3y9YI__": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(@circular__CGhYUyblqx) }).partial().optional()",
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
                      "#/components/schemas/ObjectWithRecursiveArray": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(@ref__vH6ZnJ3y9YI__) }).partial().optional()",
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
                          "method": "get",
                          "parameters": [],
                          "path": "/example",
                          "requestFormat": "json",
                          "response": "z.object({ recursiveRef: @ref__vH6ZnJ3y9YI__, basic: z.number() }).partial()",
                      },
                  ],
                  "getSchemaByRef": [Function],
                  "hashByVariableName": {
                      "@var/getExample": "@ref__vxYMP91oHSP__",
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
                      "#/components/schemas/ObjectWithRecursiveArray": "@ref__vH6ZnJ3y9YI__",
                  },
                  "zodSchemaByHash": {
                      "@ref__vH6ZnJ3y9YI__": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(@circular__CGhYUyblqx) }).partial().optional()",
                      "@ref__vxYMP91oHSP__": "z.object({ recursiveRef: @ref__vH6ZnJ3y9YI__, basic: z.number() }).partial()",
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
            '"z.object({ name: z.string(), parent: @ref__vX0WTO35546__ }).partial().optional()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "circularTokenByRef": {
                  "#/components/schemas/User": "@circular__9Dvq68jEoU",
              },
              "codeMetaByRef": {
                  "#/components/schemas/User": "z.object({ name: z.string(), parent: @ref__vX0WTO35546__ }).partial().optional()",
              },
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/User": "@ref__vX0WTO35546__",
              },
              "zodSchemaByHash": {
                  "@ref__vX0WTO35546__": "z.object({ name: z.string(), parent: @circular__9Dvq68jEoU }).partial().optional()",
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
        ).toMatchInlineSnapshot(
            '"z.object({ recursiveUser: @ref__vVy9xRe4NBJ__, basic: z.number() }).partial().optional()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "circularTokenByRef": {
                  "#/components/schemas/Friend": "@circular__y9ima2EJ1e",
                  "#/components/schemas/UserWithFriends": "@circular__HOpnp24BWM",
              },
              "codeMetaByRef": {
                  "#/components/schemas/Friend": "z.object({ nickname: z.string(), user: @circular__HOpnp24BWM, circle: z.array(@circular__y9ima2EJ1e) }).partial().optional()",
                  "#/components/schemas/UserWithFriends": "z.object({ name: z.string(), parent: @ref__vVy9xRe4NBJ__, friends: z.array(@ref__v1B6qfw6kVo__), bestFriend: @ref__v1B6qfw6kVo__ }).partial().optional()",
              },
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/Friend": "@ref__v1B6qfw6kVo__",
                  "#/components/schemas/UserWithFriends": "@ref__vVy9xRe4NBJ__",
              },
              "zodSchemaByHash": {
                  "@ref__v1B6qfw6kVo__": "z.object({ nickname: z.string(), user: @circular__HOpnp24BWM, circle: z.array(@circular__y9ima2EJ1e) }).partial().optional()",
                  "@ref__vVy9xRe4NBJ__": "z.object({ name: z.string(), parent: @circular__HOpnp24BWM, friends: z.array(@ref__v1B6qfw6kVo__), bestFriend: @ref__v1B6qfw6kVo__ }).partial().optional()",
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
                  "#/components/schemas/Friend": "z.object({ nickname: z.string(), user: @circular__HOpnp24BWM, circle: z.array(@circular__y9ima2EJ1e) }).partial().optional()",
                  "#/components/schemas/UserWithFriends": "z.object({ name: z.string(), parent: @ref__vVy9xRe4NBJ__, friends: z.array(@ref__v1B6qfw6kVo__), bestFriend: @ref__v1B6qfw6kVo__ }).partial().optional()",
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
                      "method": "get",
                      "parameters": [],
                      "path": "/example",
                      "requestFormat": "json",
                      "response": "z.object({ someUser: @ref__vVy9xRe4NBJ__, someProp: z.boolean() }).partial()",
                  },
              ],
              "getSchemaByRef": [Function],
              "hashByVariableName": {
                  "@var/getExample": "@ref__v3bU393Z54W__",
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
                  "#/components/schemas/Friend": "@ref__v1B6qfw6kVo__",
                  "#/components/schemas/UserWithFriends": "@ref__vVy9xRe4NBJ__",
              },
              "zodSchemaByHash": {
                  "@ref__v1B6qfw6kVo__": "z.object({ nickname: z.string(), user: @circular__HOpnp24BWM, circle: z.array(@circular__y9ima2EJ1e) }).partial().optional()",
                  "@ref__v3bU393Z54W__": "z.object({ someUser: @ref__vVy9xRe4NBJ__, someProp: z.boolean() }).partial()",
                  "@ref__vVy9xRe4NBJ__": "z.object({ name: z.string(), parent: @circular__HOpnp24BWM, friends: z.array(@ref__v1B6qfw6kVo__), bestFriend: @ref__v1B6qfw6kVo__ }).partial().optional()",
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
                      "method": "get",
                      "parameters": [],
                      "path": "/example",
                      "requestFormat": "json",
                      "response": "z.object({ someUser: variables["getExample"], someProp: z.boolean() }).partial()",
                  },
              ],
              "options": {
                  "baseUrl": "__baseurl__",
                  "withAlias": false,
              },
              "schemas": {
                  "v1B6qfw6kVo": "z.lazy(() => z.object({ nickname: z.string(), user: vVy9xRe4NBJ, circle: z.array(v1B6qfw6kVo) }).partial().optional())",
                  "v3bU393Z54W": "z.object({ someUser: vVy9xRe4NBJ, someProp: z.boolean() }).partial()",
                  "vVy9xRe4NBJ": "z.lazy(() => z.object({ name: z.string(), parent: vVy9xRe4NBJ, friends: z.array(v1B6qfw6kVo), bestFriend: v1B6qfw6kVo }).partial().optional())",
              },
              "typeNameByRefHash": {
                  "v1B6qfw6kVo": "Friend",
                  "vVy9xRe4NBJ": "UserWithFriends",
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
                  "getExample": "v3bU393Z54W",
              },
          }
        `);

        const data = getZodClientTemplateContext(openApiDoc);
        const prettierConfig = await resolveConfig("./");
        const template = compile(readFileSync("./src/template.hbs", "utf-8"));
        const output = template(data);
        const prettyOutput = maybePretty(output, prettierConfig);

        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { Zodios } from "@zodios/core";
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

          const v1B6qfw6kVo: z.ZodType<Friend> = z.lazy(() =>
              z
                  .object({ nickname: z.string(), user: vVy9xRe4NBJ, circle: z.array(v1B6qfw6kVo) })
                  .partial()
                  .optional()
          );
          const vVy9xRe4NBJ: z.ZodType<UserWithFriends> = z.lazy(() =>
              z
                  .object({ name: z.string(), parent: vVy9xRe4NBJ, friends: z.array(v1B6qfw6kVo), bestFriend: v1B6qfw6kVo })
                  .partial()
                  .optional()
          );
          const v3bU393Z54W = z.object({ someUser: vVy9xRe4NBJ, someProp: z.boolean() }).partial();

          const variables = {
              getExample: v3bU393Z54W,
          };

          const endpoints = [
              {
                  method: "get",
                  path: "/example",
                  requestFormat: "json",
                  response: z.object({ someUser: variables["getExample"], someProp: z.boolean() }).partial(),
              },
          ] as const;

          export const api = new Zodios("__baseurl__", endpoints);
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
            '"z.object({ playlist: @ref__vxZEqq8fd13__, by_author: @ref__vInc2fO1Pnj__ }).partial().optional()"'
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
                  "#/components/schemas/Author": "z.object({ name: z.string(), mail: z.string(), settings: @ref__vZa4k3EGBuF__ }).partial().optional()",
                  "#/components/schemas/Playlist": "z.object({ name: z.string(), author: @ref__vInc2fO1Pnj__, songs: z.array(@ref__v6Klqv8RwCG__) }).partial().optional()",
                  "#/components/schemas/Settings": "z.object({ theme_color: z.string() }).partial().optional()",
                  "#/components/schemas/Song": "z.object({ name: z.string(), duration: z.number(), in_playlists: z.array(@ref__vxZEqq8fd13__) }).partial().optional()",
              },
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/Author": "@ref__vInc2fO1Pnj__",
                  "#/components/schemas/Playlist": "@ref__vxZEqq8fd13__",
                  "#/components/schemas/Settings": "@ref__vZa4k3EGBuF__",
                  "#/components/schemas/Song": "@ref__v6Klqv8RwCG__",
              },
              "zodSchemaByHash": {
                  "@ref__v6Klqv8RwCG__": "z.object({ name: z.string(), duration: z.number(), in_playlists: z.array(@ref__vxZEqq8fd13__) }).partial().optional()",
                  "@ref__vInc2fO1Pnj__": "z.object({ name: z.string(), mail: z.string(), settings: @ref__vZa4k3EGBuF__ }).partial().optional()",
                  "@ref__vZa4k3EGBuF__": "z.object({ theme_color: z.string() }).partial().optional()",
                  "@ref__vxZEqq8fd13__": "z.object({ name: z.string(), author: @ref__vInc2fO1Pnj__, songs: z.array(@circular__XRX5ZO2W35) }).partial().optional()",
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
          "import { Zodios } from "@zodios/core";
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

          const vZa4k3EGBuF = z.object({ theme_color: z.string() }).partial().optional();
          const vInc2fO1Pnj = z.object({ name: z.string(), mail: z.string(), settings: vZa4k3EGBuF }).partial().optional();
          const v6Klqv8RwCG: z.ZodType<Song> = z.lazy(() =>
              z
                  .object({ name: z.string(), duration: z.number(), in_playlists: z.array(vxZEqq8fd13) })
                  .partial()
                  .optional()
          );
          const vxZEqq8fd13: z.ZodType<Playlist> = z.lazy(() =>
              z
                  .object({ name: z.string(), author: vInc2fO1Pnj, songs: z.array(v6Klqv8RwCG) })
                  .partial()
                  .optional()
          );
          const vXlVgeQYVO9 = z.object({ playlist: vxZEqq8fd13, by_author: vInc2fO1Pnj }).partial();

          const variables = {
              getExample: vXlVgeQYVO9,
          };

          const endpoints = [
              {
                  method: "get",
                  path: "/example",
                  requestFormat: "json",
                  response: z.object({ playlist: variables["getExample"], by_author: variables["getExample"] }).partial(),
              },
          ] as const;

          export const api = new Zodios("__baseurl__", endpoints);
          "
        `);
    });
});
