---
"openapi-zod-client": patch
---

Fixes an issue whereby you aren't able to set additionalPropsDefaultValue from command line as false because the package expects it to be a boolean, however recieves a string value
