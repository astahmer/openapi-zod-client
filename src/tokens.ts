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
        if (token === refToken) return name.replace(token, "").slice(2, -2);
        return name;
    },
    makeVar: (name: string) => varPrefix + normalizeString(name),
    makeRefHash: (zodSchemaString: string) => {
        if (!zodSchemaString) throw new Error("zodSchemaString is required");
        return refToken + `__v${hash(zodSchemaString)}__`;
    },
    makeCircularRef: (ref: string) => circularRefToken + hash(ref),
    getRefName: (ref: string) => ref.split("/").at(-1)!,
};

export function normalizeString(text: string) {
    return text
        .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .trim() // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, "_") // Replace spaces with _
        .replace(/-+/g, "_") // Replace - with _
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}
