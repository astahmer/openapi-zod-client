# openapi-zod-client

Generates a [zodios](https://github.com/ecyrbe/zodios) (_typescript http client with zod validation_) from a (json/yaml) [OpenAPI spec](https://github.com/OAI/OpenAPI-Specification) **(or just use the generated schemas/endpoints/etc !)**

-   can be used programmatically _(do w/e you want with the computed schemas/endpoints)_
-   or used as a CLI _(generates a prettier .ts file with deduplicated variables when pointing to the same schema/$ref)_

-   client typesafety using [zodios](https://github.com/ecyrbe/zodios)
-   tested (using [vitest](https://vitest.dev/)) against official [OpenAPI specs samples](https://github.com/OAI/OpenAPI-Specification/tree/main/schemas)

# Why this exists

sometimes you don't have control on your API, maybe you need to consume APIs from other teams (who might each use a different language/framework), you only have their Open API spec as source of truth, then this might help 😇

you could use `openapi-zod-client` to automate the API integration part (doesn't matter if you consume it in your front or back-end, zodios is agnostic) on your CI and just import the generated `api` client

## Comparison vs tRPC etc

please just use [tRPC](https://github.com/trpc/trpc) or alternatives if you do have control on your API/back-end

# Usage

with local install:

-   `pnpm i -D openapi-zod-client`
-   `pnpm openapi-zod-client "./input/file.json" -o "./output/client.ts"`

or directly

-   `pnpx openapi-zod-client "./input/file.yaml" -o "./output/client.ts"`

## CLI

```sh
openapi-zod-client/0.2.0

Usage:
  $ openapi-zod-client <input>

Commands:
  <input>  path/url to OpenAPI/Swagger document as json/yaml

For more info, run any command with the `--help` flag:
  $ openapi-zod-client --help

Options:
  -o, --output <path>    Output path for the zodios api client ts file (defaults to `<input>.client.ts`)
  -t, --template <path>  Template path for the handlebars template that will be used to generate the output
  -p, --prettier <path>  Prettier config path that will be used to format the output client file
  -b, --base-url <url>   Base url for the api
  -a, --with-alias       With alias as api client methods
  --error-expr <expr>    Pass an expression to determine if a response status is an error
  --success-expr <expr>  Pass an expression to determine which response status is the main success status
  -v, --version          Display version number
  -h, --help             Display this message

```

## Customization

You can pass a custom [handlebars](https://handlebarsjs.com/) template and/or a [custom prettier config](https://prettier.io/docs/en/configuration.html) with something like:

`pnpm openapi-zod-client ./example/petstore.yaml -o ./example/petstore-schemas.ts -t ./example/schemas-only.hbs -p ./example/prettier-custom.json`, there is an example [here](./example/)

## When using the CLI

-   `--success-expr` is bound to [`isMainResponseStatus`](https://github.com/astahmer/openapi-zod-client/blob/main/src/generateZodClientFromOpenAPI.ts#L212-L223)
-   `--error-expr` is bound to [`isErrorStatus`](https://github.com/astahmer/openapi-zod-client/blob/main/src/generateZodClientFromOpenAPI.ts#L224-L235)

You can pass an expression that will be safely evaluted (thanks to [whence](https://github.com/jonschlinkert/whence/)) and works like `validateStatus` from axios to determine which OpenAPI `ResponseItem` should be picked as the main one for the `ZodiosEndpoint["response"]` and which ones will be added to the `ZodiosEndpoint["errors"]` array.

Exemple: `--success-expr "status >= 200 && status < 300"`

## Tips

-   You can omit the `-o` (output path) argument if you want and it will default to the input path with a `.ts` extension: `pnpm openapi-zod-client ./input.yaml` will generate a `./input.yaml.ts` file
-   Since internally we're using [swagger-parser](https://github.com/APIDevTools/swagger-parser), you should be able to use an URL as input like this:
    `pnpx openapi-zod-client https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.yaml -o ./petstore.ts`

-   Also, multiple-files-documents ($ref pointing to another file) should work out-of-the-box as well, but if it doesn't, maybe [dereferencing](https://apitools.dev/swagger-parser/docs/swagger-parser.html#dereferenceapi-options-callback) your document before passing it to `openapi-zod-client` could help

## Example

-   You can check an example [input](./example/petstore.yaml) (the petstore example when you open/reset [editor.swagger.io](https://editor.swagger.io/)) and [output](./example/petstore-client.ts)
-   there's also [an example of a programmatic usage](./example/petstore-generator.ts)
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
import { asApi, Zodios } from "@zodios/core";
import { z } from "zod";

const vz089ZHJr6H = z.object({ id: z.number(), name: z.string(), tag: z.string().optional() });
const vvHrKrAZzfP = z.array(vz089ZHJr6H);
const vusbpdVpqWm = z.object({ code: z.number(), message: z.string() });

const variables = {
    Error: vusbpdVpqWm,
    Pet: vz089ZHJr6H,
    Pets: vvHrKrAZzfP,
    createPets: vusbpdVpqWm,
    listPets: vusbpdVpqWm,
    showPetById: vusbpdVpqWm,
};

const endpoints = asApi([
    {
        method: "get",
        path: "/pets",
        requestFormat: "json",
        parameters: [
            {
                name: "limit",
                type: "Query",
                schema: z.number().optional(),
            },
        ],
        response: variables["Pets"],
    },
    {
        method: "post",
        path: "/pets",
        requestFormat: "json",
        response: variables["Error"],
    },
    {
        method: "get",
        path: "/pets/:petId",
        requestFormat: "json",
        response: variables["Pet"],
    },
]);

export const api = new Zodios(endpoints);
```

# TODO

-   handle default values (output `z.default(xxx)`)
-   handle OA spec `format: date-time` -> output `z.date()` / `preprocess` ?
-   handle string/number constraints -> output z.`min max length email url uuid startsWith endsWith regex trim nonempty gt gte lt lte int positive nonnegative negative nonpositive multipleOf`
-   handle OA `prefixItems` -> output `z.tuple`
-   add an argument to control which response should be added (currently by status code === "200" or when there is a "default")
-   rm unused (=never referenced) variables from output

# Caveats

NOT tested/expected to work with OpenAPI before v3, please migrate your specs to v3+ if you want to use this

## Contributing:

-   `pnpm i && pnpm gen`

if you fix an edge case please make a dedicated minimal reproduction test in the [`tests`](./tests) folder so that it doesn't break in future versions
