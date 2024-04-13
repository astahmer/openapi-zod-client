import type { SchemaObject } from "openapi3-ts";

export default function generateJSDocArray(schema: SchemaObject, withTypesAndFormat = false): string[] {
    const comments: string[] = [];

    const mapping = {
        description: (value: string) => `${value}`,
        example: (value: any) => `@example ${JSON.stringify(value)}`,
        examples: (value: any[]) =>
            value.map((example, index) => `@example Example ${index + 1}: ${JSON.stringify(example)}`),
        deprecated: (value: boolean) => (value ? "@deprecated" : ""),
        default: (value: any) => `@default ${JSON.stringify(value)}`,
        externalDocs: (value: { url: string }) => `@see ${value.url}`,
        // Additional attributes that depend on `withTypesAndFormat`
        type: withTypesAndFormat
            ? (value: string | string[]) => `@type {${Array.isArray(value) ? value.join("|") : value}}`
            : undefined,
        format: withTypesAndFormat ? (value: string) => `@format ${value}` : undefined,
        minimum: (value: number) => `@minimum ${value}`,
        maximum: (value: number) => `@maximum ${value}`,
        minLength: (value: number) => `@minLength ${value}`,
        maxLength: (value: number) => `@maxLength ${value}`,
        pattern: (value: string) => `@pattern ${value}`,
        enum: (value: string[]) => `@enum ${value.join(", ")}`,
    };

    Object.entries(mapping).forEach(([key, mappingFunction]) => {
        const schemaValue = schema[key as keyof SchemaObject];
        if (schemaValue !== undefined && mappingFunction) {
            const result = mappingFunction(schemaValue);
            if (Array.isArray(result)) {
                result.forEach((subResult) => comments.push(subResult));
            } else if (result) {
                comments.push(result);
            }
        }
    });

    // Add a space line after description if there are other comments
    if (comments.length > 1 && !!schema.description) {
        comments.splice(1, 0, "");
    }

    return comments;
}
