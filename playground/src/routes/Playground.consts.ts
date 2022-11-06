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
    {
        name: "Grouped by tag (split files)",
        value: "grouped-tag-file",
        template: "template-default",
        options: { groupStrategy: "tag-file" },
    },
    {
        name: "Grouped by method (split files)",
        value: "grouped-method-file",
        template: "template-default",
        options: { groupStrategy: "method-file" },
    },
] as PresetTemplate[];
