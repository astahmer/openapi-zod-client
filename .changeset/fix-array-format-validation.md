---
"openapi-zod-client": patch
---

Fix format validation for string items in arrays. Previously, format specifications (such as `date-time`) were ignored for array items, resulting in loose validation. This change ensures that the specified formats are now correctly applied to all string items within arrays.
