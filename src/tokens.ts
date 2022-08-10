import { hash } from "ohash";

const varAlias = "@var/" as const;
const refAlias = "@ref" as const;
type TokenAlias = typeof varAlias | typeof refAlias;

export const tokens = {
    varAlias,
    refAlias,
    refAliasRegex: new RegExp(`${refAlias}__\\w{10}__`, "g"),
    isTokenAlias: (name: string, token: TokenAlias) => name.startsWith(token),
    rmTokenAlias: (name: string, token: TokenAlias) =>
        token === "@var/" ? name.replace(token, "") : name.replace(token, "").slice(2, -2),
    makeVarAlias: (name: string) => varAlias + normalizeString(name),
    makeRefAlias: (zodSchemaString: string) => refAlias + `__${hash(zodSchemaString)}__`,
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
