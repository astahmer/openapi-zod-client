import { hash } from "ohash";

const varPrefix = "@var/" as const;
const refToken = "@ref" as const;
type TokenAlias = typeof varPrefix | typeof refToken;

export const tokens = {
    varPrefix,
    refToken,
    refTokenHashRegex: new RegExp(`${refToken}__v\\w{10}__`, "g"),
    isToken: (name: string, token: TokenAlias) => name.startsWith(token),
    rmToken: (name: string, token: TokenAlias) =>
        token === "@var/" ? name.replace(token, "") : name.replace(token, "").slice(2, -2),
    makeVar: (name: string) => varPrefix + normalizeString(name),
    makeRefHash: (zodSchemaString: string) => {
        if (!zodSchemaString) throw new Error("zodSchemaString is required");
        return refToken + `__v${hash(zodSchemaString)}__`;
    },
};

function normalizeString(text: string) {
    return text
        .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .trim() // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, "_") // Replace spaces with _
        .replace(/-+/g, "_") // Replace - with _
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}
