# openapi-zod-client

## 1.17.0

### Minor Changes

-   [#283](https://github.com/astahmer/openapi-zod-client/pull/283) [`3ec4915`](https://github.com/astahmer/openapi-zod-client/commit/3ec491572e56fc40e3b49cefb58cb6f08600190f) Thanks [@dgadelha](https://github.com/dgadelha)! - Add `schemaRefiner` option to allow refining the OpenAPI schema before its converted to a Zod schema

## 1.16.4

### Patch Changes

-   [#279](https://github.com/astahmer/openapi-zod-client/pull/279) [`f3ee25e`](https://github.com/astahmer/openapi-zod-client/commit/f3ee25efc191d0be97231498924fe50fd977fb88) Thanks [@dgadelha](https://github.com/dgadelha)! - Fix multiline descriptions when `describe` is enabled

## 1.16.3

### Patch Changes

-   [#276](https://github.com/astahmer/openapi-zod-client/pull/276) [`aa4c7a3`](https://github.com/astahmer/openapi-zod-client/commit/aa4c7a3668c6d96492bcd319ccd940f0b735b029) Thanks [@tankers746](https://github.com/tankers746)! - Fixed bug which was excluding falsy default values

## 1.16.2

### Patch Changes

-   [#271](https://github.com/astahmer/openapi-zod-client/pull/271) [`197316b`](https://github.com/astahmer/openapi-zod-client/commit/197316b50b0b84cea977984ae82441f2ce108ea0) Thanks [@codingmatty](https://github.com/codingmatty)! - Fix invalid output when using array types as the endpoint body with minItems or maxItems and using the tag-file group-strategy.

## 1.16.1

### Patch Changes

-   [#270](https://github.com/astahmer/openapi-zod-client/pull/270) [`04dd1b5`](https://github.com/astahmer/openapi-zod-client/commit/04dd1b549118c8b8e5a3b86f6dbed741f44770c8) Thanks [@codingmatty](https://github.com/codingmatty)! - Fix bug with `exportAllNamedSchemas` option where schemas will reuse last schema name with matching schema rather than it's own name that has already been used before.

## 1.16.0

### Minor Changes

-   [#268](https://github.com/astahmer/openapi-zod-client/pull/268) [`f62be48`](https://github.com/astahmer/openapi-zod-client/commit/f62be48c9d66fb432b5b68570f8de4755644d1d5) Thanks [@codingmatty](https://github.com/codingmatty)! - Add `exportAllNamedSchemas` option to allow exporting duplicate schemas with different names.

## 1.15.1

### Patch Changes

-   [`73f6726`](https://github.com/astahmer/openapi-zod-client/commit/73f67268fb51a43b8c5ef92427ef9abeedccb086) Thanks [@astahmer](https://github.com/astahmer)! - Add a `--strict-objects` CLI flag: Use strict validation for objects so we don't allow unknown keys. Defaults to false. thanks @iceydee

## 1.15.0

### Minor Changes

-   [#261](https://github.com/astahmer/openapi-zod-client/pull/261) [`00ed1ee`](https://github.com/astahmer/openapi-zod-client/commit/00ed1ee84ddf88a68e05927395e56a9861394e60) Thanks [@C-ra-ZY](https://github.com/C-ra-ZY)! - Fix #260 by infer types of items in a required only allOf item.

## 1.14.0

### Minor Changes

-   [#258](https://github.com/astahmer/openapi-zod-client/pull/258) [`8c80b43`](https://github.com/astahmer/openapi-zod-client/commit/8c80b4325048ab9861269739f3011b2380a3b958) Thanks [@marrowleaves](https://github.com/marrowleaves)! - Fix #257 by inferring as object when only required array defined

## 1.13.4

### Patch Changes

-   [#254](https://github.com/astahmer/openapi-zod-client/pull/254) [`6e5a589`](https://github.com/astahmer/openapi-zod-client/commit/6e5a589025b070308dbc9dd4402d2fa1fac9d349) Thanks [@jayvdb](https://github.com/jayvdb)! - fix: Bump axios to avoid CVE-2023-45857

## 1.13.3

### Patch Changes

-   [#251](https://github.com/astahmer/openapi-zod-client/pull/251) [`2859ede`](https://github.com/astahmer/openapi-zod-client/commit/2859edee065fa24fef69be6241ab9c773724fe7f) Thanks [@ezze](https://github.com/ezze)! - Fix "Cannot read properties of undefined (reading 'ref')" type error for file group strategies

## 1.13.2

### Patch Changes

-   [#248](https://github.com/astahmer/openapi-zod-client/pull/248) [`fd5f850`](https://github.com/astahmer/openapi-zod-client/commit/fd5f850492bf384586d079350f021475014e1767) Thanks [@nmcdaines](https://github.com/nmcdaines)! - Fixes an issue whereby you aren't able to set additionalPropsDefaultValue from command line as false because the package expects it to be a boolean, however recieves a string value

-   [#249](https://github.com/astahmer/openapi-zod-client/pull/249) [`8dfb265`](https://github.com/astahmer/openapi-zod-client/commit/8dfb265ee23bb79b2c8fe0dd979103c89f0bcf4f) Thanks [@nmcdaines](https://github.com/nmcdaines)! - Fix issue using discriminated union when there are multiple items within an allOf block by reverting to a union type for this case

-   [#247](https://github.com/astahmer/openapi-zod-client/pull/247) [`1e1dcd8`](https://github.com/astahmer/openapi-zod-client/commit/1e1dcd8c40aa9db6bacbe170410543387bbf3403) Thanks [@tillschweneker](https://github.com/tillschweneker)! - When a property from an external json or yaml file starts with a number, e.g. 1st, instead of first, the generated Zod-Schema is corrupt. The change in the wrapWithQuotesIfNeeded method makes sure, that any property starting with a number is wrapped in quotes.

## 1.13.1

### Patch Changes

-   [#242](https://github.com/astahmer/openapi-zod-client/pull/242) [`81efd49`](https://github.com/astahmer/openapi-zod-client/commit/81efd491ee6a884b252e8fbaaefdfd565220ef9d) Thanks [@imballinst](https://github.com/imballinst)! - chore: make endpointDefinitionRefiner to receive final fields that are going to be used in handlebars

## 1.13.0

### Minor Changes

-   [#234](https://github.com/astahmer/openapi-zod-client/pull/234) [`096d8b4`](https://github.com/astahmer/openapi-zod-client/commit/096d8b4f6bbf0c829ef5dd3c02a11468ba2654b4) Thanks [@ArthurGoupil](https://github.com/ArthurGoupil)! - Add option `withAllResponses` to be receive a `responses` array containing all responses (succes & error)

## 1.12.1

### Patch Changes

-   [#232](https://github.com/astahmer/openapi-zod-client/pull/232) [`efebdf2`](https://github.com/astahmer/openapi-zod-client/commit/efebdf2627e79d2fb759096667d445cc137446fd) Thanks [@ArthurGoupil](https://github.com/ArthurGoupil)! - Pass options object to `getZodSchema` when `shouldExportAllSchemas` is true.

## 1.12.0

### Minor Changes

-   [`7396fe8`](https://github.com/astahmer/openapi-zod-client/commit/7396fe8a087b9a3e8f7bab52fd5b728a3519a7bd) Thanks [@astahmer](https://github.com/astahmer)! - Add additionalPropsDefaultValue flag in case additionalProperties is not provided

## 1.11.1

### Patch Changes

-   [`536a541`](https://github.com/astahmer/openapi-zod-client/commit/536a541d2723ee16cc6d573aea47919591e9a650) Thanks [@astahmer](https://github.com/astahmer)! - Thanks @mayorandrew !

    ***

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

## 1.11.0

### Minor Changes

-   [#221](https://github.com/astahmer/openapi-zod-client/pull/221) [`5e55304`](https://github.com/astahmer/openapi-zod-client/commit/5e553044dc4dd216e4bebf11b88646a9b9d65f1a) Thanks [@craigmiller160](https://github.com/craigmiller160)! - Added the "all readonly" feature, which allows for generating schemas & types with all arrays and object properties set to readonly.

## 1.10.8

### Patch Changes

-   [#219](https://github.com/astahmer/openapi-zod-client/pull/219) [`114e809`](https://github.com/astahmer/openapi-zod-client/commit/114e809f4bb66e43fb6371942aad99f42c4bc86d) Thanks [@PeterMK85](https://github.com/PeterMK85)! - Handlebars helper `toCamelCase` should not touch the string if it's already in camel case.

## 1.10.7

### Patch Changes

-   [#212](https://github.com/astahmer/openapi-zod-client/pull/212) [`63c32a0`](https://github.com/astahmer/openapi-zod-client/commit/63c32a01408bf90efeeb5d506d5c3994d297c39e) Thanks [@eli0shin](https://github.com/eli0shin)! - Limit --export-types to object types to prevent type errors from zod validation methods like `.min`

## 1.10.6

### Patch Changes

-   [#210](https://github.com/astahmer/openapi-zod-client/pull/210) [`675a132`](https://github.com/astahmer/openapi-zod-client/commit/675a13226ec3c4598130d16b09c5a79969d77177) Thanks [@eli0shin](https://github.com/eli0shin)! - Support nullable for array of types, oneOf, anyOf, and allOf in generated typescript types

## 1.10.5

### Patch Changes

-   [#206](https://github.com/astahmer/openapi-zod-client/pull/206) [`9a25ee0`](https://github.com/astahmer/openapi-zod-client/commit/9a25ee0a79e40f4221ba3565d39cb08f25b2bdf3) Thanks [@eli0shin](https://github.com/eli0shin)! - Add --export-types option to generate types for all schemas

## 1.10.4

### Patch Changes

-   [#204](https://github.com/astahmer/openapi-zod-client/pull/204) [`477bbec`](https://github.com/astahmer/openapi-zod-client/commit/477bbecda5669a99355cccde3290ef907325a4b7) Thanks [@filipbekic01](https://github.com/filipbekic01)! - Add nullable primitives and arrays support

## 1.10.3

### Patch Changes

-   [#202](https://github.com/astahmer/openapi-zod-client/pull/202) [`f18e3ea`](https://github.com/astahmer/openapi-zod-client/commit/f18e3ea6b8f9606e9b505fcaf4fb311c81ce8a42) Thanks [@PeterMK85](https://github.com/PeterMK85)! - Add `camelCase` formatting to `hbs` files.

-   [#197](https://github.com/astahmer/openapi-zod-client/pull/197) [`bd6e958`](https://github.com/astahmer/openapi-zod-client/commit/bd6e958337cd1085e2bc9eb122a0147d02937135) Thanks [@mjperrone](https://github.com/mjperrone)! - Fix bug with regex's that have / in them

## 1.10.2

### Patch Changes

-   [`8de58d5`](https://github.com/astahmer/openapi-zod-client/commit/8de58d54c13292ce433c30eb45e883967d1e06f6) Thanks [@astahmer](https://github.com/astahmer)! - update pastable again

## 1.10.1

### Patch Changes

-   [`ed41d1c`](https://github.com/astahmer/openapi-zod-client/commit/ed41d1cb7d482cc3e8bda6739e57b751d05d55aa) Thanks [@astahmer](https://github.com/astahmer)! - update pastable to a version with license

## 1.10.0

### Minor Changes

-   [#183](https://github.com/astahmer/openapi-zod-client/pull/183) [`c9118af`](https://github.com/astahmer/openapi-zod-client/commit/c9118af8bfc05e42daa1b3c50c63c394f73d74bf) Thanks [@simonbinwang](https://github.com/simonbinwang)! - Add nullable support for additional properties

-   [#189](https://github.com/astahmer/openapi-zod-client/pull/189) [`d897485`](https://github.com/astahmer/openapi-zod-client/commit/d897485021271734c54925da53e829689ae06838) Thanks [@jbach](https://github.com/jbach)! - handle $ref in responses object

-   [#190](https://github.com/astahmer/openapi-zod-client/pull/190) [`e23b42d`](https://github.com/astahmer/openapi-zod-client/commit/e23b42de097f2fcf4b83de57a43495779946e449) Thanks [@imballinst](https://github.com/imballinst)! - feat: reduce dependency count threshold for a type to be imported from common file to just 1

### Patch Changes

-   [#184](https://github.com/astahmer/openapi-zod-client/pull/184) [`44a5587`](https://github.com/astahmer/openapi-zod-client/commit/44a558767e85871b8116038fed3df60c46baf6d1) Thanks [@imballinst](https://github.com/imballinst)! - fix: fix order of schemas when using option groupStrategy: tag-file

## 1.9.0

### Minor Changes

-   [#163](https://github.com/astahmer/openapi-zod-client/pull/163) [`0270e4c`](https://github.com/astahmer/openapi-zod-client/commit/0270e4c50b3559ec284a0b75f338c76fdc006e48) Thanks [@WickyNilliams](https://github.com/WickyNilliams)! - treat additionalProperties as defaulting to true, allowing passthrough() unless explicitly opting-out

-   [#174](https://github.com/astahmer/openapi-zod-client/pull/174) [`b12151d`](https://github.com/astahmer/openapi-zod-client/commit/b12151d92b0998566ca450d38e647b42401e2b79) Thanks [@imballinst](https://github.com/imballinst)! - feat: add endpointDefinitionRefiner to TemplateContext options

## 1.8.0

### Minor Changes

-   [#166](https://github.com/astahmer/openapi-zod-client/pull/166) [`2308541`](https://github.com/astahmer/openapi-zod-client/commit/2308541bb9ecdca068243f1479a0fc0785439de0) Thanks [@scarf005](https://github.com/scarf005)! - take `withAlias: false` into account

-   [#165](https://github.com/astahmer/openapi-zod-client/pull/165) [`4860e75`](https://github.com/astahmer/openapi-zod-client/commit/4860e75db9eb5904725e09d4d5e68ea7182ecc10) Thanks [@scarf005](https://github.com/scarf005)! - updated and used ts-pattern more

## 1.7.2

### Patch Changes

-   [#160](https://github.com/astahmer/openapi-zod-client/pull/160) [`bdcc143`](https://github.com/astahmer/openapi-zod-client/commit/bdcc143a157d28b80cc786eb491e2377e3fca362) Thanks [@WickyNilliams](https://github.com/WickyNilliams)! - add missing zod chains to response bodies

-   [#161](https://github.com/astahmer/openapi-zod-client/pull/161) [`5d98868`](https://github.com/astahmer/openapi-zod-client/commit/5d98868b75a5464d4aa6ac02bdf4dd07a65e6c2b) Thanks [@WickyNilliams](https://github.com/WickyNilliams)! - allow timezones in date-time strings

## 1.7.1

### Patch Changes

-   [#154](https://github.com/astahmer/openapi-zod-client/pull/154) [`2486ce5`](https://github.com/astahmer/openapi-zod-client/commit/2486ce5535f4366a534e027ee1e92293be3034c7) Thanks [@janwvjaarsveld](https://github.com/janwvjaarsveld)! - Fix issue where path parameters containing underscores were also converted to camelCase

-   [#151](https://github.com/astahmer/openapi-zod-client/pull/151) [`2ef2cb1`](https://github.com/astahmer/openapi-zod-client/commit/2ef2cb137231557961feeebfecaa831937e38fa7) Thanks [@WickyNilliams](https://github.com/WickyNilliams)! - improve types for anyOf, to closer match json-schema behavior

## 1.7.0

### Minor Changes

-   [#148](https://github.com/astahmer/openapi-zod-client/pull/148) [`1fb7603`](https://github.com/astahmer/openapi-zod-client/commit/1fb7603633d6f78d0429908df73a545559a83964) Thanks [@astahmer](https://github.com/astahmer)! - parameter descriptions in openapi are included in the zod schema

### Patch Changes

-   [#140](https://github.com/astahmer/openapi-zod-client/pull/140) [`6e5605b`](https://github.com/astahmer/openapi-zod-client/commit/6e5605b8e392f3fb482333de00a213f47f388a3b) Thanks [@janwvjaarsveld](https://github.com/janwvjaarsveld)! - Handle hyphenated path parameters on endpoint definition

-   [#149](https://github.com/astahmer/openapi-zod-client/pull/149) [`d165193`](https://github.com/astahmer/openapi-zod-client/commit/d1651936c60f98abb5665d40294f128f8952e2fa) Thanks [@feychenie](https://github.com/feychenie)! - Fix TS generation of [any|one|all]Of when used with refs

## 1.6.4

### Patch Changes

-   [#137](https://github.com/astahmer/openapi-zod-client/pull/137) [`d6091c9`](https://github.com/astahmer/openapi-zod-client/commit/d6091c9d87152e03a18e8e94b890c528b088b847) Thanks [@jmiller14](https://github.com/jmiller14)! - fix extraneous semicolon after discriminated union

## 1.6.3

### Patch Changes

-   [#122](https://github.com/astahmer/openapi-zod-client/pull/122) [`5965c3f`](https://github.com/astahmer/openapi-zod-client/commit/5965c3fb2ad543de14c4c1546aadb0dc76948a1f) Thanks [@FakeGodd](https://github.com/FakeGodd)! - added support for requestBody.$ref

## 1.6.2

### Patch Changes

-   [#119](https://github.com/astahmer/openapi-zod-client/pull/119) [`d340a17`](https://github.com/astahmer/openapi-zod-client/commit/d340a17df0907975148f06709baccdc57fecc980) Thanks [@robert-wysocki-sparkbit](https://github.com/robert-wysocki-sparkbit)! - Fix handling patterns with forward slashes

-   [#113](https://github.com/astahmer/openapi-zod-client/pull/113) [`a4607b0`](https://github.com/astahmer/openapi-zod-client/commit/a4607b0f10fabbce9e291827712673581887c24b) Thanks [@robert-wysocki-sparkbit](https://github.com/robert-wysocki-sparkbit)! - Fix handling "exclusiveMinimum: false"

## 1.6.1

### Patch Changes

-   [#106](https://github.com/astahmer/openapi-zod-client/pull/106) [`9594450`](https://github.com/astahmer/openapi-zod-client/commit/95944505551a2fc37e96d4f72c104af8f03e6a4e) Thanks [@dominik-parkopedia](https://github.com/dominik-parkopedia)! - Make use of discriminated unions if oneOf discriminator is defined

## 1.6.0

### Minor Changes

-   [#98](https://github.com/astahmer/openapi-zod-client/pull/98) [`3e2406d`](https://github.com/astahmer/openapi-zod-client/commit/3e2406d8432e3f1de6edcf635e9946304533e38d) Thanks [@sirtimbly](https://github.com/sirtimbly)! - ## Feature: Support for Datetime string format

    > **Warning**<br>
    > Upgrade your zod package to version >= 3.2.0

    Because zod now supports validating strings as proper ISO datetimes with `.datetime()` since [Zod 3.2.0](https://github.com/colinhacks/zod/releases/tag/v3.20), and 'date-time' is one of the supported string `format` values in the OpenAPI and JSON Schema spec. Any string with that datetime format will now be validated as being a ISO UTC datetime string.

    ## Fixed: Minimum 0 and MinLength 0

    Minimum 0 and MinLength 0 were not being converted to `.gte()` and `.min()` because of a type coercion bug.

## 1.5.8

### Patch Changes

-   [#96](https://github.com/astahmer/openapi-zod-client/pull/96) [`dc16074`](https://github.com/astahmer/openapi-zod-client/commit/dc16074f377492d1337ae55366ce54573865adc9) Thanks [@feychenie](https://github.com/feychenie)! - Improvement: Add `withDefaultValues` (default `true`) config option to control presend of default values in the zod schemas

-   [#96](https://github.com/astahmer/openapi-zod-client/pull/96) [`dc16074`](https://github.com/astahmer/openapi-zod-client/commit/dc16074f377492d1337ae55366ce54573865adc9) Thanks [@feychenie](https://github.com/feychenie)! - Improves default values conversion to not depend on the presence of a single-value "type" schema attribute

## 1.5.7

### Patch Changes

-   [#93](https://github.com/astahmer/openapi-zod-client/pull/93) [`16f5ccc`](https://github.com/astahmer/openapi-zod-client/commit/16f5ccc43f738122c4e06f79ede41a35efb801c1) Thanks [@feychenie](https://github.com/feychenie)! - Improvement: add the ability to set a custom `alias` generation function in the `withAlias` option.

## 1.5.6

### Patch Changes

-   [#91](https://github.com/astahmer/openapi-zod-client/pull/91) [`6ca10ff`](https://github.com/astahmer/openapi-zod-client/commit/6ca10ffae57332ef94e2e3b5f3bacf03a7759bbc) Thanks [@feychenie](https://github.com/feychenie)! - Fixed an issue with non-string enums containing a single value, resulting in an invalid zod union

## 1.5.5

### Patch Changes

-   [#89](https://github.com/astahmer/openapi-zod-client/pull/89) [`b3e273a`](https://github.com/astahmer/openapi-zod-client/commit/b3e273abc89a3b7240119ba61ee48ad0de86c38f) Thanks [@feychenie](https://github.com/feychenie)! - Fixes and issue where default values for objects are incorrectly set (or ommited) in the zod schema.

## 1.5.4

### Patch Changes

-   [#86](https://github.com/astahmer/openapi-zod-client/pull/86) [`e582b84`](https://github.com/astahmer/openapi-zod-client/commit/e582b84d33d86fbbd6f32ac6522ad30258031dac) Thanks [@feychenie](https://github.com/feychenie)! - Fixes and issue where default values for arrays are incorrectly set (or ommited) in the zod schema.

-   [#87](https://github.com/astahmer/openapi-zod-client/pull/87) [`7a21616`](https://github.com/astahmer/openapi-zod-client/commit/7a216161c6f4f8de3b4f014bcfc39a1fae075e42) Thanks [@feychenie](https://github.com/feychenie)! - Fixed an issue where 'oneOf', 'anyOf', 'allOf' schemas containing a single item being a '$ref' would cause the zod schema generation to fail.

## 1.5.3

### Patch Changes

-   [#82](https://github.com/astahmer/openapi-zod-client/pull/82) [`1b1cde2`](https://github.com/astahmer/openapi-zod-client/commit/1b1cde2c7b61ede4494ae829706e5682a05eb85d) Thanks [@astahmer](https://github.com/astahmer)! - feat(default template): createApiClient options?

## 1.5.2

### Patch Changes

-   [#79](https://github.com/astahmer/openapi-zod-client/pull/79) [`e88a7cc`](https://github.com/astahmer/openapi-zod-client/commit/e88a7ccd35871b09030e822bf11d84f5c419b2f8) Thanks [@astahmer](https://github.com/astahmer)! - feat(#78): support common PathItemObject["parameters"]

## 1.5.1

### Patch Changes

-   [`b9d5360`](https://github.com/astahmer/openapi-zod-client/commit/b9d536099994150db40ab044dee069437fc2f219) Thanks [@astahmer](https://github.com/astahmer)! - [feat: support undefined schema refs #76](https://github.com/astahmer/openapi-zod-client/pull/76), thanks to [alex-lucas](https://github.com/alex-lucas)

## 1.5.0

### Minor Changes

-   [#74](https://github.com/astahmer/openapi-zod-client/pull/74) [`1267233`](https://github.com/astahmer/openapi-zod-client/commit/126723319262c882d0ee0cd10397472a58dd61de) Thanks [@astahmer](https://github.com/astahmer)! - fix(#73): fallback response to void when no schemas

## 1.4.20

### Patch Changes

-   [#71](https://github.com/astahmer/openapi-zod-client/pull/71) [`6a111d1`](https://github.com/astahmer/openapi-zod-client/commit/6a111d1e1574450e53e6fe91299863223108688c) Thanks [@astahmer](https://github.com/astahmer)! - feat: add an exported createApiClient function in default templates

-   [#71](https://github.com/astahmer/openapi-zod-client/pull/71) [`85828be`](https://github.com/astahmer/openapi-zod-client/commit/85828be2b4ad4f07cb3c969cac94c45a912cc85e) Thanks [@astahmer](https://github.com/astahmer)! - feat: export schemas object in default templates

## 1.4.19

### Patch Changes

-   [`af7d9d8`](https://github.com/astahmer/openapi-zod-client/commit/af7d9d86dd01d6f1df51d194e6da36ebdd2ee0f7) Thanks [@astahmer](https://github.com/astahmer)! - bump
