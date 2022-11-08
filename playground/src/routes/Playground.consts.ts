import type { OptionsFormValues } from "../components/OptionsForm";

export type PresetTemplate = { name: string; preset: string; template: string; options?: Partial<OptionsFormValues> };
export const presetTemplateList = [
    { name: "Default", preset: "default", template: "template-default", options: { groupStrategy: "none" } },
    { name: "Grouped by tag", preset: "grouped-tag", template: "template-grouped", options: { groupStrategy: "tag" } },
    {
        name: "Grouped by method",
        preset: "grouped-method",
        template: "template-grouped",
        options: { groupStrategy: "method" },
    },
    {
        name: "Schemas only",
        preset: "schemas-only",
        template: "template-schemas-only",
        options: { groupStrategy: "none", shouldExportAllSchemas: true },
    },
    {
        name: "Grouped by tag (split files)",
        preset: "grouped-tag-file",
        template: "template-default",
        options: { groupStrategy: "tag-file" },
    },
    {
        name: "Grouped by method (split files)",
        preset: "grouped-method-file",
        template: "template-default",
        options: { groupStrategy: "method-file" },
    },
] as PresetTemplate[];
