---
"openapi-zod-client": patch
---

When a property from an external json or yaml file starts with a number, e.g. 1st, instead of first, the generated Zod-Schema is corrupt. The change in the wrapWithQuotesIfNeeded method makes sure, that any property starting with a number is wrapped in quotes.
