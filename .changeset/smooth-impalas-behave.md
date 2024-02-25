---
"openapi-zod-client": patch
---

Fix bug with `exportAllNamedSchemas` option where schemas will reuse last schema name with matching schema rather than it's own name that has already been used before.
