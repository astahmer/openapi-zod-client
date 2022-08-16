# openapi-zod-client

Generates a [zodios](https://github.com/ecyrbe/zodios) (_typescript http client with zod validation_) from a (json/yaml) [OpenAPI spec](https://github.com/OAI/OpenAPI-Specification)

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

# Example

-   You can check an example [input](./example/petstore.yaml) (the petstore example when you open/reset [editor.swagger.io](https://editor.swagger.io/)) and [output](./example/petstore-client.ts)

-   there's also [an example of a programmatic usage](./example/petstore-generator.ts)

-   or you can check the tests in the `src` folder which are mostly just inline snapshots of the outputs

## Contributing:

-   `pnpm i && pnpm gen`
