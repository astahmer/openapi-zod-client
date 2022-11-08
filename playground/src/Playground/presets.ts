import { default as petstoreYaml } from "../../../examples/petstore.yaml?raw";
import { default as defaultOutputTemplate } from "../../../lib/src/templates/default.hbs?raw";

export const presets = {
    defaultTemplate: defaultOutputTemplate,
    defaultInput: petstoreYaml,
    defaultPrettierConfig: {
        printWidth: 120,
        tabWidth: 4,
        arrowParens: "always",
        useTabs: false,
        semi: true,
        singleQuote: false,
        trailingComma: "es5",
    } as const,
    getTemplates: async () => {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        const record = await import.meta.glob("../../../lib/src/templates/*.hbs", { as: "raw", eager: true });
        return Object.fromEntries(
            Object.entries(record).map(([key, value]) => [key.replace(/.*\/(.*)\.hbs/, "template-$1"), value])
        );
    },
    // getSamples: () => import.meta.glob("../../../samples/**/*.hbs", { as: "raw", eager: true }),
};
