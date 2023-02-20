# openapi-zod-client

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
