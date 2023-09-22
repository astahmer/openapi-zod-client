---
"openapi-zod-client": patch
---

Thanks @mayorandrew !

---

[OpenAPI 3.0.3 Data Types](https://spec.openapis.org/oas/v3.0.3#data-types) are defined by [JSON Schema Specification Wright Draft 00](https://datatracker.ietf.org/doc/html/draft-wright-json-schema-00#section-4.2).

However, the specification mentions that "null is not supported as a type" and the `nullable` keyword should be used instead. While it is a valid solution in most cases, it is not possible to use `nullable` together with `$ref`. One possible workaround is to define a Null schema and use it in combination with `oneOf`, like so:

```json
{
    "oneOf": [
        { "$ref": "#/components/schemas/MySchema" },
        {
            "type": "string",
            "enum": [null],
            "nullable": true
        }
    ]
}
```

It may look contradictory, but according to the [enum section of JSON Schema Validation Wright Draft 00](https://datatracker.ietf.org/doc/html/draft-wright-json-schema-validation-00#section-5.20):

> The value of this keyword MUST be an array. This array SHOULD have
> at least one element. Elements in the array SHOULD be unique.
>
> Elements in the array MAY be of any type, including null.
>
> An instance validates successfully against this keyword if its value
> is equal to one of the elements in this keyword's array value.

This means that `null` is a possible value for the "enum" validation of "type" "string".

This schema also passes the `swagger-cli validate` check.

The openapi-zod-client library currently crashes when generating a TypeScript type for this construct. Additionally, the generated zod schemas are not correct when using a `null` value in "enum" along with other values. This PR fixes that.

https://github.com/astahmer/openapi-zod-client/pull/227
