import type { TemplateContext } from "./template-context";

const OBJECT_REGEX = /\.object\({(?<content>.+)}\)(?!\.readonly)/;

const makeObjectsReadonly = (schema: string): string => "";
const makeArraysReadonly = (schema: string): string => "";

// TODO need a test for a nested object/array
export const convertToReadonlyContext = (context: TemplateContext): TemplateContext => {
    const newContext: TemplateContext = {
        ...context,
        schemas: {}
    };
    Object.entries(context.schemas)
        .map(([typeName, schema]): [string, string] => [typeName, makeObjectsReadonly(schema)])
        .map(([typeName, schema]): [string, string] => [typeName, makeArraysReadonly(schema)])
        .forEach(([typeName, schema]) => {
            newContext.schemas[typeName] = schema;
        });
};