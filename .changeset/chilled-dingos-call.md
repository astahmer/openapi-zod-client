---
"openapi-zod-client": minor
---

## Feature: Support for Datetime string format

> **Warning**<br>
> Upgrade your zod package to version >= 3.2.0

Because zod now supports validating strings as proper ISO datetimes with `.datetime()` since [Zod 3.2.0](https://github.com/colinhacks/zod/releases/tag/v3.20), and 'date-time' is one of the supported string `format` values in the OpenAPI and JSON Schema spec. Any string with that datetime format will now be validated as being a ISO UTC datetime string.

## Fixed: Minimum 0 and MinLength 0

Minimum 0 and MinLength 0 were not being converted to `.gte()` and `.min()` because of a type coercion bug.
