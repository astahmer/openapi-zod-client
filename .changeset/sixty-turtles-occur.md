---
"openapi-zod-client": patch
---

Fixed an issue where 'oneOf', 'anyOf', 'allOf' schemas containing a single item being a '$ref' would cause the zod schema generation to fail.
