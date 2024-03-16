[![npm version](https://img.shields.io/npm/v/openapi-zod-client.svg)](https://www.npmjs.com/package/openapi-zod-client)

# openapi-zod-client

[![Screenshot 2022-11-12 at 18 52 25](https://user-images.githubusercontent.com/47224540/201487856-ffc4c862-6f31-4de1-8ef1-3981fabf3416.png)](https://openapi-zod-client.vercel.app/)

Generates a [zodios](https://github.com/ecyrbe/zodios) (_typescript http client with zod validation_) from a (json/yaml) [OpenAPI spec](https://github.com/OAI/OpenAPI-Specification) **(or just use the generated schemas/endpoints/etc !)**

-   can be used programmatically _(do w/e you want with the computed schemas/endpoints)_
-   or used as a CLI _(generates a prettier .ts file with deduplicated variables when pointing to the same schema/$ref)_

-   client typesafety and runtime validation using [zodios](https://github.com/ecyrbe/zodios)
-   tested (using [vitest](https://vitest.dev/)) against official [OpenAPI specs samples](https://github.com/OAI/OpenAPI-Specification/tree/main/schemas)

# Why this exists

Sometimes you don't have control on your API, maybe you need to consume APIs from other teams (who might each use a different language/framework), you only have their Open API spec as source of truth, then this might help 😇

You could use `openapi-zod-client` to automate the API integration part (doesn't matter if you consume it in your front or back-end, zodios is agnostic) on your CI and just import the generated `api` client

## Comparison vs tRPC zodios ts-rest etc

If you do have control on your API/back-end, you should probably use a RPC-like solution like [tRPC](https://github.com/trpc/trpc), [zodios](https://www.zodios.org/) or [ts-rest](https://ts-rest.com/) instead of this.

# Comparison vs typed-openapi

-   `openapi-zod-client` is a CLI that generates a [zodios](https://www.zodios.org/) API client (typescript http client with zod validation), currently using axios as http client
-   [`typed-openapi`](https://github.com/astahmer/typed-openapi) is a CLI/library that generates a headless (bring your own fetcher : fetch, axios, ky, etc...) Typescript API client from an OpenAPI spec, that can output schemas as either just TS types (providing instant suggestions in your IDE) or different runtime validation schemas (zod, typebox, arktype, valibot, io-ts, yup)

# Usage

with local install:

-   `pnpm i -D openapi-zod-client`
-   `pnpm openapi-zod-client "./input/file.json" -o "./output/client.ts"`

or directly (no install)

-   `pnpx openapi-zod-client "./input/file.yaml" -o "./output/client.ts"`

# auto-generated doc

https://paka.dev/npm/openapi-zod-client

## CLI

```sh
openapi-zod-client/1.15.0

Usage:
  $ openapi-zod-client <input>

Commands:
  <input>  path/url to OpenAPI/Swagger document as json/yaml

For more info, run any command with the `--help` flag:
  $ openapi-zod-client --help

Options:
  -o, --output <path>               Output path for the zodios api client ts file (defaults to `<input>.client.ts`)
  -t, --template <path>             Template path for the handlebars template that will be used to generate the output
  -p, --prettier <path>             Prettier config path that will be used to format the output client file
  -b, --base-url <url>              Base url for the api
  --no-with-alias                   With alias as api client methods (default: true)
  -a, --with-alias                  With alias as api client methods (default: true)
  --api-client-name <name>          when using the default `template.hbs`, allow customizing the `export const {apiClientName}`
  --error-expr <expr>               Pass an expression to determine if a response status is an error
  --success-expr <expr>             Pass an expression to determine which response status is the main success status
  --media-type-expr <expr>          Pass an expression to determine which response content should be allowed
  --export-schemas                  When true, will export all `#/components/schemas`
  --implicit-required               When true, will make all properties of an object required by default (rather than the current opposite), unless an explicitly `required` array is set
  --with-deprecated                 when true, will keep deprecated endpoints in the api output
  --with-description                when true, will add z.describe(xxx)
  --with-docs                       when true, will add jsdoc comments to generated types 
  --group-strategy                  groups endpoints by a given strategy, possible values are: 'none' | 'tag' | 'method' | 'tag-file' | 'method-file'
  --complexity-threshold            schema complexity threshold to determine which one (using less than `<` operator) should be assigned to a variable
  --default-status                  when defined as `auto-correct`, will automatically use `default` as fallback for `response` when no status code was declared
  --all-readonly                    when true, all generated objects and arrays will be readonly
  --export-types                    When true, will defined types for all object schemas in `#/components/schemas`
  --additional-props-default-value  Set default value when additionalProperties is not provided. Default to true. (default: true)
  --strict-objects                  Use strict validation for objects so we don't allow unknown keys. Defaults to false. (default: false)
  -v, --version                     Display version number
  -h, --help                        Display this message
```

## Customization

You can pass a custom [handlebars](https://handlebarsjs.com/) template and/or a [custom prettier config](https://prettier.io/docs/en/configuration.html) with something like:

`pnpm openapi-zod-client ./example/petstore.yaml -o ./example/petstore-schemas.ts -t ./example/schemas-only.hbs -p ./example/prettier-custom.json --export-schemas`, there is an example of the output [here](./examples/schemas-only/petstore-schemas.ts)

## When using the CLI

-   `--success-expr` is bound to [`isMainResponseStatus`](https://github.com/astahmer/openapi-zod-client/blob/b7717b53023728d077ceb2f451e4787f32945b3d/src/generateZodClientFromOpenAPI.ts#L234-L244)
-   `--error-expr` is bound to [`isErrorStatus`](https://github.com/astahmer/openapi-zod-client/blob/b7717b53023728d077ceb2f451e4787f32945b3d/src/generateZodClientFromOpenAPI.ts#L245-L256)

You can pass an expression that will be safely evaluted (thanks to [whence](https://github.com/jonschlinkert/whence/)) and works like `validateStatus` from axios to determine which OpenAPI `ResponseItem` should be picked as the main one for the `ZodiosEndpoint["response"]` and which ones will be added to the `ZodiosEndpoint["errors"]` array.

Exemple: `--success-expr "status >= 200 && status < 300"`

## Tips

-   You can omit the `-o` (output path) argument if you want and it will default to the input path with a `.ts` extension: `pnpm openapi-zod-client ./input.yaml` will generate a `./input.yaml.ts` file
-   Since internally we're using [swagger-parser](https://github.com/APIDevTools/swagger-parser), you should be able to use an URL as input like this:
    `pnpx openapi-zod-client https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.yaml -o ./petstore.ts`

-   Also, multiple-files-documents ($ref pointing to another file) should work out-of-the-box as well, but if it doesn't, maybe [dereferencing](https://apitools.dev/swagger-parser/docs/swagger-parser.html#dereferenceapi-options-callback) your document before passing it to `openapi-zod-client` could help
-   If you only need a few portions of your OpenAPI spec (i.e. only using a few endpoints from the [GitHub REST API OpenAPI Spec](https://github.com/OAI/OpenAPI-Specification)), consider using [openapi-endpoint-trimmer](https://github.com/aacitelli/openapi-endpoint-trimmer) to trim unneeded paths from your spec first. It supports prefix-based omitting of paths, helping significantly cut down on the length of your output types file, which generally improves editor speed and compilation times.

## Example

-   You can check an example [input](./examples/petstore.yaml) (the petstore example when you open/reset [editor.swagger.io](https://editor.swagger.io/)) and [output](./examples/basic/petstore-client.ts)
-   there's also [an example of a programmatic usage](./examples/basic/petstore-generator.ts)
-   or you can check the tests in the `src` folder which are mostly just inline snapshots of the outputs

# tl;dr

[input](./samples/v3.0/petstore.yaml):

```yaml
openapi: "3.0.0"
info:
    version: 1.0.0
    title: Swagger Petstore
    license:
        name: MIT
servers:
    - url: http://petstore.swagger.io/v1
paths:
    /pets:
        get:
            summary: List all pets
            operationId: listPets
            tags:
                - pets
            parameters:
                - name: limit
                  in: query
                  description: How many items to return at one time (max 100)
                  required: false
                  schema:
                      type: integer
                      format: int32
            responses:
                "200":
                    description: A paged array of pets
                    headers:
                        x-next:
                            description: A link to the next page of responses
                            schema:
                                type: string
                    content:
                        application/json:
                            schema:
                                $ref: "#/components/schemas/Pets"
                default:
                    description: unexpected error
                    content:
                        application/json:
                            schema:
                                $ref: "#/components/schemas/Error"
        post:
            summary: Create a pet
            operationId: createPets
            tags:
                - pets
            responses:
                "201":
                    description: Null response
                default:
                    description: unexpected error
                    content:
                        application/json:
                            schema:
                                $ref: "#/components/schemas/Error"
    /pets/{petId}:
        get:
            summary: Info for a specific pet
            operationId: showPetById
            tags:
                - pets
            parameters:
                - name: petId
                  in: path
                  required: true
                  description: The id of the pet to retrieve
                  schema:
                      type: string
            responses:
                "200":
                    description: Expected response to a valid request
                    content:
                        application/json:
                            schema:
                                $ref: "#/components/schemas/Pet"
                default:
                    description: unexpected error
                    content:
                        application/json:
                            schema:
                                $ref: "#/components/schemas/Error"
components:
    schemas:
        Pet:
            type: object
            required:
                - id
                - name
            properties:
                id:
                    type: integer
                    format: int64
                name:
                    type: string
                tag:
                    type: string
        Pets:
            type: array
            items:
                $ref: "#/components/schemas/Pet"
        Error:
            type: object
            required:
                - code
                - message
            properties:
                code:
                    type: integer
                    format: int32
                message:
                    type: string
```

output:

```ts
import { makeApi, Zodios } from "@zodios/core";
import { z } from "zod";

const Pet = z.object({ id: z.number().int(), name: z.string(), tag: z.string().optional() });
const Pets = z.array(Pet);
const Error = z.object({ code: z.number().int(), message: z.string() });

export const schemas = {
    Pet,
    Pets,
    Error,
};

const endpoints = makeApi([
    {
        method: "get",
        path: "/pets",
        requestFormat: "json",
        parameters: [
            {
                name: "limit",
                type: "Query",
                schema: z.number().int().optional(),
            },
        ],
        response: z.array(Pet),
    },
    {
        method: "post",
        path: "/pets",
        requestFormat: "json",
        response: z.void(),
    },
    {
        method: "get",
        path: "/pets/:petId",
        requestFormat: "json",
        parameters: [
            {
                name: "petId",
                type: "Path",
                schema: z.string(),
            },
        ],
        response: Pet,
    },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string) {
    return new Zodios(baseUrl, endpoints);
}
```

# TODO

-   handle OA `prefixItems` -> output `z.tuple`
-   rm unused (=never referenced) variables from output

# Caveats

NOT tested/expected to work with OpenAPI before v3, please migrate your specs to v3+ if you want to use this

You can do so by using the official Swagger Editor: https://editor.swagger.io/ using the Edit -> Convert to OpenAPI 3.0 menu

## Contributing:

-   A `.node-version` file has been provided in the repository root, use your preferred Node.js manager which [supports](https://github.com/shadowspawn/node-version-usage#supporting-products) the standard to manage the development Node.js environment
-   The monorepo supports [corepack](https://nodejs.org/api/corepack.html), follow the linked instructions to locally install the development package manager (i.e. [pnpm](https://pnpm.io/))

```bash
> pnpm install
> pnpm test
```

Assuming no issue were raised by the tests, you may use `pnpm dev` to watch for code changes during development.

If you fix an edge case please make a dedicated minimal reproduction test in the [`tests`](./tests) folder so that it doesn't break in future versions

Make sure to generate a [changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md) before submitting your PR.
