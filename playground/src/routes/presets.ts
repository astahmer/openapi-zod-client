import { default as defaultOutputTemplate } from "../../../lib/src/templates/default.hbs?raw";
import { default as petstoreYaml } from "../../../examples/petstore.yaml?raw";

export const presets = {
    defaultTemplate: defaultOutputTemplate,
    defaultInput: petstoreYaml,
    getTemplates: () => import.meta.glob("../../../lib/src/template/*.hbs", { as: "raw" }),
    getSamples: () => import.meta.glob("../../../samples/**/*.hbs", { as: "raw" }),
};
