import { capitalize, kebabToCamel } from "pastable/server";

export const getRefName = (ref: string) => normalizeString(ref.split("/").at(-1)!);
export const getRefFromName = (name: string) => `#/components/schemas/${name}`;

export function normalizeString(text: string) {
    const prefixed = prefixStringStartingWithNumberIfNeeded(text);
    return prefixed
        .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .trim() // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, "_") // Replace spaces with _
        .replace(/-+/g, "_") // Replace - with _
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

const prefixStringStartingWithNumberIfNeeded = (str: string) => {
    const firstAsNumber = Number(str[0]);
    if (typeof firstAsNumber === "number" && !isNaN(firstAsNumber)) {
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
