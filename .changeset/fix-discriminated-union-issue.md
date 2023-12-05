---
"openapi-zod-client": patch
---

Fix issue using discriminated union when there are multiple items within an allOf block by reverting to a union type for this case
