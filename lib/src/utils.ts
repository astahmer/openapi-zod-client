import type { SchemaObject } from "openapi3-ts";
import { capitalize, kebabToCamel } from "pastable/server";

export const asComponentSchema = (name: string) => `#/components/schemas/${name}`;

export function normalizeString(text: string) {
    const prefixed = prefixStringStartingWithNumberIfNeeded(text);
    return prefixed
        .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .trim() // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, "_") // Replace spaces with _
        .replace(/-+/g, "_") // Replace - with _
        .replace(/[^\w\-]+/g, "_") // Remove all non-word chars
        .replace(/--+/g, "-"); // Replace multiple - with single -
}

export const wrapWithQuotesIfNeeded = (str: string) => {
    if (/^\w+$/.test(str)) {
        return str;
    }

    return `"${str}"`;
};

const prefixStringStartingWithNumberIfNeeded = (str: string) => {
    const firstAsNumber = Number(str[0]);
    if (typeof firstAsNumber === "number" && !Number.isNaN(firstAsNumber)) {
        return "_" + str;
    }

    return str;
};

const pathParamWithBracketsRegex = /({\w+})/g;
const wordPrecededByNonWordCharacter = /[^\w\-]+/g;

/** @example turns `/media-objects/{id}` into `MediaObjectsId` */
export const pathToVariableName = (path: string) =>
    capitalize(kebabToCamel(path).replaceAll("/", "")) // /media-objects/{id} -> MediaObjects{id}
        .replace(pathParamWithBracketsRegex, (group) => capitalize(group.slice(1, -1))) // {id} -> Id
        .replace(wordPrecededByNonWordCharacter, "_"); // "/robots.txt" -> "/robots_txt"

type SingleType = Exclude<SchemaObject["type"], any[] | undefined>;
export const isPrimitiveType = (type: SingleType): type is PrimitiveType => primitiveTypeList.includes(type as any);

const primitiveTypeList = ["string", "number", "integer", "boolean", "null"] as const;
export type PrimitiveType = typeof primitiveTypeList[number];

export const escapeControlCharacters = (str: string): string => {
    return str
        .replace(/\t/g, "\\t") // U+0009
        .replace(/\n/g, "\\n") // U+000A
        .replace(/\r/g, "\\r") // U+000D
        .replace(/([\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFE\uFFFF])/g, (_m, p1) => {
            const dec: number = p1.codePointAt();
            const hex: string = dec.toString(16);
            // eslint-disable-next-line sonarjs/no-nested-template-literals
            if (dec <= 0xff) return `\\x${`00${hex}`.slice(-2)}`;
            // eslint-disable-next-line sonarjs/no-nested-template-literals
            return `\\u${`0000${hex}`.slice(-4)}`;
        })
        .replace(/\//g, "\\/");
};
