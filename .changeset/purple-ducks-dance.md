---
"openapi-zod-client": patch
---

Fix escaping of forward slash `/` in pattern regex so the output code will be `/\//`. This change also breaks escaping of unnecessarily escaped forward slash `\/` in pattern regex, such that the output code will be `/\\//`.
