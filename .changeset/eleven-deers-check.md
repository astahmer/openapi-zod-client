---
"openapi-zod-client": major
---

-   Added support for predefined templates (#131)
-   Refactored templates to use Handlebars partials (may break custom templates if directly referencing built-ins)
-   Added support for the `x-enumName` extension attribute
-   Added new predefined templates: `export-schemas`, `schemas-only` (#131)
-   Bumped dependencies
-   Added Corepack and `.node-version` support for developer environment
-   Fixed non-default group-strategy templates (#129)
