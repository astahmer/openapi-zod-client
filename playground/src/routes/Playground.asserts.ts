export const isValidDocumentName = (name: string) =>
    !isValidPrettierConfig(name) && (name.endsWith(".yml") || name.endsWith(".yaml") || name.endsWith(".json"));

export const isValidTemplateName = (name: string) => name.endsWith(".hbs");
export const isValidPrettierConfig = (name: string) => name.startsWith(".prettier") && name.endsWith(".json");
