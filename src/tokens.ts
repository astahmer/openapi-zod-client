import { hash } from "ohash";

const varPrefix = "@var/" as const;
const refToken = "@ref" as const;
const circularRefToken = "@circular__" as const;
type TokenAlias = typeof varPrefix | typeof refToken | typeof circularRefToken;

export const tokens = {
    varPrefix,
    refToken,
    circularRefToken,
    refTokenHashRegex: new RegExp(`${refToken}__v\\w{10}__`, "g"),
    circularRefRegex: new RegExp(`${circularRefToken}(\\w{10})`, "g"),
    isToken: (name: string, token: TokenAlias) => name.startsWith(token),
    rmToken: (name: string, token: TokenAlias) => {
        if (token === varPrefix) return name.replace(token, "");
        if (token === refToken && name.startsWith(token)) {
            // @ref__v1234567890__ => 1234567890
            return name.replace(token, "").slice(2, -2);
        }

        // @ref__SchemaName => SchemaName
        return name;
    },
    makeVar: (name: string) => varPrefix + normalizeString(name),
    makeRefHash: (zodSchemaString: string) => {
        if (!zodSchemaString) throw new Error("zodSchemaString is required");
        return refToken + `__v${hash(zodSchemaString)}__`;
    },
    makeCircularRef: (ref: string) => circularRefToken + hash(ref),
    getRefName: (ref: string) => prefixStringStartingWithNumberIfNeeded(ref.split("/").at(-1)!),
};

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
