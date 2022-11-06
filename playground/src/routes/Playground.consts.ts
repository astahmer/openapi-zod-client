import { OptionsFormValues } from "../components/OptionsForm";

export type PresetTemplate = { name: string; value: string; template: string; options?: Partial<OptionsFormValues> };
export const presetTemplateList = [
    { name: "Default", value: "default", template: "template-default", options: { groupStrategy: "none" } },
    { name: "Grouped by tag", value: "grouped-tag", template: "template-grouped", options: { groupStrategy: "tag" } },
    {
        name: "Grouped by method",
        value: "grouped-method",
        template: "template-grouped",
        options: { groupStrategy: "method" },
    },
    {
        name: "Schemas only",
        value: "schemas-only",
        template: "template-schemas-only",
        options: { shouldExportAllSchemas: true },
    },
] as PresetTemplate[];
