# openapi-zod-client

Generates a [zodios](https://github.com/ecyrbe/zodios) (_typescript http client with zod validation_) from a (json/yaml) [OpenAPI spec](https://github.com/OAI/OpenAPI-Specification) (or just use the generated schemas/endpoints/etc !)

-   can be used programmatically _(do w/e you want with the computed schemas/endpoints)_
-   or used as a CLI _(generates a prettier .ts file with deduplicated variables when pointing to the same schema/$ref)_

-   client typesafety using [zodios](https://github.com/ecyrbe/zodios)
-   tested (using [vitest](https://vitest.dev/)) against official [OpenAPI specs samples](https://github.com/OAI/OpenAPI-Specification/tree/main/schemas)

# Usage

with local install:

-   `pnpm i -D openapi-zod-client`
-   `pnpm openapi-zod-client "./input/file.json" -o "./output/client.ts"`

or directly

-   `pnpx openapi-zod-client "./input/file.yaml" -o "./output/client.ts"`

## Customization

You can pass a custom [handlebars](https://handlebarsjs.com/) template and/or a [custom prettier config](https://prettier.io/docs/en/configuration.html) with something like:
`pnpm openapi-zod-client ./example/petstore.yaml -o ./example/petstore-schemas.ts -t ./example/schemas-only.hbs -p ./example/prettier-custom.json`, there is an example [here](./example/)

## Tips

-   Since internally we're making use of [swagger-parser](https://github.com/APIDevTools/swagger-parser), you should be able to use directly using an input URL like this:
    `pnpx openapi-zod-client https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.yaml -o ./petstore.ts`

-   Also, multiple-files-documents ($ref pointing to another file) should work out-of-the-box as well, but if it doesn't, maybe [dereferencing](https://apitools.dev/swagger-parser/docs/swagger-parser.html#dereferenceapi-options-callback) your document before passing it to `openapi-zod-client` could help

## Example

-   You can check an example [input](./example/petstore.yaml) (the petstore example when you open/reset [editor.swagger.io](https://editor.swagger.io/)) and [output](./example/petstore-client.ts)
-   there's also [an example of a programmatic usage](./example/petstore-generator.ts)
-   or you can check the tests in the `src` folder which are mostly just inline snapshots of the outputs

# tl;dr

input:

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
import { Zodios } from "@zodios/core";
import { z } from "zod";

const v7LgRCMpuZ0 = z.object({ id: z.bigint(), name: z.string(), tag: z.string().optional() }).optional();
const vWZd2G8UeSs = z.array(v7LgRCMpuZ0).optional();
const v77smkx5YEB = z.object({ code: z.bigint(), message: z.string() }).optional();

const variables = {
    Error: v77smkx5YEB,
    Pet: v7LgRCMpuZ0,
    Pets: vWZd2G8UeSs,
    createPets: v77smkx5YEB,
    listPets: v77smkx5YEB,
    showPetById: v77smkx5YEB,
};

const endpoints = [
    {
        method: "get",
        path: "/pets",
        requestFormat: "json",
        parameters: [
            {
                name: "limit",
                type: "Query",
                schema: z.bigint().optional(),
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
        path: "/pets/{petId}",
        requestFormat: "json",
        response: variables["Pet"],
    },
] as const;

export const api = new Zodios("baseurl", endpoints);
```

# TODO

-   handle default values (output `z.default(xxx)`)
-   handle OA spec `format: date-time` -> output `z.date()` / `preprocess` ?
-   handle string/number constraints -> output z.`min max length email url uuid startsWith endsWith regex trim nonempty gt gte lt lte int positive nonnegative negative nonpositive multipleOf`
-   handle OA `prefixItems` -> output `z.tuple`
-   handle recursive schemas -> output `z.lazy()`
-   add an argument to control which response should be added (currently by status code === "200" or when there is a "default")
-   rm unused (=never referenced) variables from output

## Contributing:

-   `pnpm i && pnpm gen`

if you fix an edge case please make a dedicated minimal reproduction test in the [`tests`](./tests) folder so that it doesn't break in future versions
