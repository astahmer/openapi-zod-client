# openapi-zod-client

Generate a [zodios](https://github.com/ecyrbe/zodios) (_typescript http client with zod validation_) from a (json/yaml) [OpenAPI spec](https://github.com/OAI/OpenAPI-Specification)

-   can be used programmatically (do w/e you want with the computed schemas/endpoints)
-   or used as a CLI (generates a prettier .ts file with deduplicated variables when pointing to the same schema/$ref)

-   client typesafety using: https://github.com/ecyrbe/zodios
-   tested (using [vitest](https://vitest.dev/)) against official OpenAPI specs samples: https://github.com/OAI/OpenAPI-Specification/tree/main/schemas

# Usage

with local install:

-   pnpm i -D openapi-zod-client
-   pnpm openapi-zod-client "./input/file.json" -o "./output/client.ts"

or directly

-   pnpmx openapi-zod-client "./input/file.yaml" -o "./output/client.ts"

## Contributing:

-   pnpm i && pnpm gen
