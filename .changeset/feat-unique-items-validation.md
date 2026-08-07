---
"openapi-zod-client": minor
---

Add uniqueItems validation support for OpenAPI array schemas

- Arrays with `uniqueItems: true` now generate proper Zod validation with deep equality checking
- Uses fast-deep-equal library for efficient duplicate detection
- Array validations (min, max, uniqueItems) are now applied at the array schema definition level - previously, e.g. when used as a schema for an object property, the array schema did not contain these validations, only the object property.
