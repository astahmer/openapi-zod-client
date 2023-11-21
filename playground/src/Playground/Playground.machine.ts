import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { TemplateContext } from "openapi-zod-client";
import { getHandlebars, getZodClientTemplateContext, maybePretty } from "openapi-zod-client";
import type { AwaitFn } from "pastable";
import { capitalize, limit, pick, removeAtIndex, safeJSONParse, updateAtIndex } from "pastable";
import { createContextWithHook } from "pastable/react";
import type { Options as PrettierOptions } from "prettier";
import { match } from "ts-pattern";
import type { InterpreterFrom } from "xstate";
import { assign, createMachine } from "xstate";
import { parse } from "yaml";

import type { OptionsFormValues } from "../components/OptionsForm";
import { defaultOptionValues } from "../components/OptionsForm";
import { toasts } from "../toasts";
import { deletingParamInUrl, resetUrl, updateUrlWithCompressedString, updateUrlWithParam } from "../url-saver";
import { isValidDocumentName, isValidPrettierConfig, isValidTemplateName } from "./Playground.asserts";
import type { PresetTemplate } from "./Playground.consts";
import { presetTemplateList } from "./Playground.consts";
import { presets } from "./presets";

export type FileTabData = { name: string; content: string; index: number; preset?: string };

type PlaygroundContext = {
    monaco: Monaco | null;
    inputEditor: editor.IStandaloneCodeEditor | null;
    outputEditor: editor.IStandaloneCodeEditor | null;

    options: OptionsFormValues;
    previewOptions: OptionsFormValues;
    optionsFormKey: number;

    activeInputTab: string;
    activeInputIndex: number;
    inputList: FileTabData[];

    activeOutputTab: string;
    activeOutputIndex: number;
    outputList: FileTabData[];

    selectedOpenApiFileName: string;
    selectedTemplateName: string;
    selectedPresetTemplate: string;
    selectedPrettierConfig: string;

    templateContext: TemplateContext | null;
    presetTemplates: Record<string, string>;

    fileForm: FileTabData;
};

type PlaygroundEvent =
    | { type: "Editor Loaded"; editor: editor.IStandaloneCodeEditor; name: "input" | "output"; monaco?: Monaco }
    | { type: "Update input"; value: string }
    | { type: "Select input tab"; tab: FileTabData }
    | { type: "Select output tab"; tab: FileTabData }
    | { type: "Select preset template"; presetTemplate: PresetTemplate }
    | { type: "Open options" }
    | { type: "Close options" }
    | { type: "Open monaco settings" }
    | { type: "Add file" }
    | { type: "Edit file"; tab: FileTabData }
    | { type: "Remove file"; tab: FileTabData }
    | { type: "Save" }
    | { type: "Reset" }
    | { type: "Update preview options"; options: OptionsFormValues }
    | { type: "Reset preview options" }
    | { type: "Save options"; options: OptionsFormValues }
    | { type: "Update monaco settings" }
    | { type: "Submit file modal"; tab: FileTabData }
    | { type: "Close modal" };

const initialInputList = [
    { name: "api.doc.yaml", content: presets.defaultInput, index: 0, preset: "petstore.yaml" },
    { name: "template.hbs", content: presets.defaultTemplate, index: 1, preset: presetTemplateList[0].preset },
    {
        name: ".prettierrc.json",
        content: JSON.stringify(presets.defaultPrettierConfig, null, 4),
        index: 2,
        preset: "prettier",
    },
    { name: "api.doc.json", content: presets.defaultInputJson, index: 3, preset: "petstore.json" },
] as const; // TODO as FileTabData[] with ts 4.9 satisfies
const initialOuputTab = "api.client.ts";

const initialContext: PlaygroundContext = {
    monaco: null,
    inputEditor: null,
    outputEditor: null,
    options: defaultOptionValues,
    previewOptions: defaultOptionValues,
    optionsFormKey: 0,
    templateContext: null,
    activeInputTab: initialInputList[0].name,
    activeInputIndex: 0,
    inputList: initialInputList as any as FileTabData[], // TODO rm with ts 4.9 satisfies
    selectedOpenApiFileName: initialInputList[0].name,
    selectedTemplateName: initialInputList[1].name,
    selectedPresetTemplate: initialInputList[1].preset,
    selectedPrettierConfig: initialInputList[2].name,
    presetTemplates: {},
    activeOutputTab: initialOuputTab,
    activeOutputIndex: 0,
    outputList: [{ name: initialOuputTab, content: "", index: 0 }],
    fileForm: { name: "", content: "", index: -1 },
};

const safeYAMLParse = (value: string): string | null => {
    try {
        return parse(value);
    } catch {
        return null;
    }
};

export const playgroundMachine =
    /** @xstate-layout N4IgpgJg5mDOIC5QAcA2BDAnlATgewFcA7CAOlT3QgEsioBiAURoBc8cACAGUokgG0ADAF1EKPLGotqeImJAAPRAFoAHAEYALKUEBWAGwAmVasPq9+waoA0ITIk2HBpXZtUB2V58273ATn1dAF8g2zQsXEIScl5aBmYpdm5eAXVRJBBkCSkZOQylBGVzPz9STXdzfXLAgz8AZlt7BDd3Und9d01BLrrLPUMQsIxsfGIyHDAqTFIABWG4+ghZMFJaADc8AGsVmBYZidgwFgAVMABbcJY4IXTxSWlZeQLlM31SOo+6rXdO9Sd9Gx2RB-VTOJygn4aQwA9R1QaZYaRMakCZTWbzOj0ACqyAg6CuHFoyAILBu8iy91yT0QoNIhk6gj87lU+i+3UawIC2nMjm6tVUdUE7nh4RGUXGkwg0zmWAWOLxBKJJP4aXJ2QeeVABV0pVclh1ql06lUJVcHIQZjMLhMdX8JsMdT8mhFiNG0VRUvRssxAGUwKgwABjFiEojEkMsdAAIzJGQpOUe+UQ9PULkE+lhnT86cF6nNHV0bWhfI+Gk09RdETdErRMswCz9AeDofDHEjMdVcfVVKTFv8pHMLPahjMbnT5tMhfUrKZmltWl0vkrYuRHulGIYjaDIaVEej-EMt0y3cTWuTqm0Jt0jsdQp+mk05r8ApcPgzbjnOt0qmXSPdkvXb1N39bcWxJNt9zqI94w1akLT8QxSENVwvgvB0WUBJp1C0Oo6UEMwdXw9xoR+X9qxRACvXrX0QObQgWFbdtYzuBNNUURBBWcTpiP8B8fFcFlzT+EoyhHR0HSdOpDGCUIESrcUKNrDd6C3ZtkAOI423OS4wGY49KVPdjmncXDGTnAJ1B1IxDHqISvlKFlp10B0nDtMiFLXKiFgAeWQMAiA4PBkA1WA9Jgnsz0KAxUzqAxPCcvxsIBITdG6AdPGczoDCcGShnk1dKLrHy-ICs5ZHQQM8A4Q4WGkOhQpENUDLY55LFabpbQ0bN-AdXQhOZbQARs689DnQxNHUdyCqUoD6AAQQgCAOAAM2oAMwpPFqVGNVQdGczQjGwwRLKZQwhMED42n0SwEOki7jGFWTRT-GtPSKzEEhDVb1sartmrg5R2inB1yyqfC3zOoEEHqUpoRHEo-G-Zleim-8ZuohgACVzjwNYwBWtbdN+ljYN7ZQjWcfCjHaa7wTMIToVKKSmRMjQARNPxUdewCMZU9A8Y2-7e3MXD6V8ep03BY68yhrQRzKKTp0EY6KnKXK5JXNG3uU7GasF1i4JFulPH8QUjCsaWUqcK7yjqcpn2vNwucUz1PriQLgtyWBsVxfF8fUsA1moMAAHcPZC-XSciopBz28oR06YwDCE8pnBZb8qnMH51ArJ7XQ8yi3bocOvfoXXNIDoPQ5L2QGugzaAc8XaHpsxKdRKa67I8Uh9ERj4JOnYxnc8ouoBrohvZ9fn8aCiPif0g2ycNXbLPcRkjV6Cbk9ljNCw6Y7DXpLpYWHwvWHd2fS4AYQoQ5x7rprF+jte98Ca6mSdEiGh362AXLUFTBOiSqfNEo8OBlSIBVKqNU6pQG9jfCQ+Myp4lQJHCKRk1BSR7jZaE+oTIjhllhDwbx8JaCqCYfCAp1bPXIiPc+xdvr43bCpAgUYzhSAJgGcBeAUFoMMs8Yo2gnDTjqB4WKZhCGIHwTocoE0Jo-AZI9PKmtuakDAYwiCUZ6AILvsg9AqD57hX4SoASpB6hlhHDZWEPgJzSTKNnbohoaaczzvlLW0wr6olgZwph0YWFsI4RovRBj65C2jqY8xq8WgIV6E+LQPcTSshZMrey1D87TU9J4yY3iNHMJ0Ugnh+i+FbUKLaHQXwvisnBh0LQT4qhtBMMRVkVQnA+C5mXOA1AABeRNQlPwwRZK6phpz1GMNCc00lUy9yZOYAiPhQYhFkkQHhcByTpOiBQKgcRH5Rwwdha240hT-ysPUSRCBRFTg8KdRmB1nSuJUS7Hm2y-r9IKLtEojgur7xspUhm6hWi8XNq4f57MQGu3oWPS+tcdnoOeKYN4tshRaGzIaPQKcnTvGBala82ELxgumGAiBUDqpHFgfAF5uznjZlKCc6SF5JIzP6vUNo04uhxVikYH89yXqPLURCnxmiYXGMKPFMoDs9CMgFGvfQE4sH+FSjU0GLIBjctoZRLJ+J3a5OjEKkpLw5xtACDMu2n9HRPnLArboiUfAIUsJNVVBcpi6oBthAwcdiJHyTjKqGGciz6hMFURKngubOrJn8NKo0PWJ0NN6poNk3jGn8D8ZWAJKn6EWUEIAA */
    createMachine(
        {
            predictableActionArguments: true,
            id: "playground",
            tsTypes: {} as import("./Playground.machine.typegen").Typegen0,
            schema: {
                context: {} as PlaygroundContext,
                events: {} as PlaygroundEvent,
            },
            context: initialContext,
            initial: "loading",
            states: {
                loading: {
                    on: {
                        "Editor Loaded": [
                            {
                                target: "ready",
                                actions: ["assignEditorRef", "updateOutput"],
                                cond: "willInputAndOutputEditorBothBeReady",
                            },
                            {
                                actions: "assignEditorRef",
                            },
                        ],
                    },
                },
                ready: {
                    initial: "Playing",
                    states: {
                        Playing: {
                            on: {
                                "Update input": [
                                    {
                                        actions: [
                                            "updateInput",
                                            "updateUrl",
                                            "updateOutput",
                                            "updateSelectedDocOrTemplate",
                                        ],
                                        cond: "wasInputEmpty",
                                    },
                                    { actions: ["updateInput", "updateUrl", "updateOutput"] },
                                ],
                                "Select input tab": [
                                    {
                                        actions: ["selectInputTab", "updateSelectedOpenApiFileName", "updateOutput"],
                                        cond: "isNextTabAnotherOpenApiDoc",
                                    },
                                    {
                                        actions: ["selectInputTab", "updateSelectedTemplateName", "updateOutput"],
                                        cond: "isNextTabAnotherTemplate",
                                    },
                                    {
                                        actions: ["selectInputTab", "updateSelectedPrettierConfig", "updateOutput"],
                                        cond: "isNextTabAnotherPrettierConfig",
                                    },
                                    { actions: ["selectInputTab"] },
                                ],
                                "Select output tab": { actions: "selectOutputTab" },
                                "Select preset template": { actions: ["selectPresetTemplate", "updateOutput"] },
                                "Open options": { target: "Editing options" },
                                "Open monaco settings": { target: "Editing monaco settings" },
                                "Add file": { target: "Creating file tab", actions: "initFileForm" },
                                "Edit file": { target: "Editing file tab", actions: "assignFileToForm" },
                                "Remove file": {
                                    actions: [
                                        "removeFile",
                                        "updateSelectedOpenApiFileName",
                                        "updateSelectedTemplateName",
                                        "updateSelectedPrettierConfig",
                                        "updateOutput",
                                    ],
                                },
                                Save: { actions: "updateUrl" },
                                Reset: { actions: ["reset", "updateOutput"] },
                            },
                            invoke: {
                                id: "getPresetTemplates",
                                src: async () => presets.getTemplates(),
                                onDone: {
                                    actions: assign({
                                        presetTemplates: (_ctx: any, event) => {
                                            return event.data as AwaitFn<typeof presets.getTemplates>;
                                        },
                                    }),
                                },
                            },
                        },
                        "Editing options": {
                            on: {
                                "Update preview options": { actions: "updatePreviewOptions" },
                                "Reset preview options": { actions: "resetPreviewOptions" },
                                "Save options": { target: "Playing", actions: ["updateOptions", "updateOutput"] },
                                "Close options": { target: "Playing" },
                            },
                        },
                        "Editing monaco settings": {
                            on: {
                                // TODO
                                // "Update monaco settings": { actions: "updateMonacoSettings" },
                                "Close modal": { target: "Playing" },
                            },
                        },
                        "Editing file tab": {
                            tags: ["file"],
                            on: {
                                "Submit file modal": {
                                    target: "Playing",
                                    actions: [
                                        "updateEditingFile",
                                        "selectInputTab",
                                        "updateInputEditorValue",
                                        "updateSelectedOpenApiFileName",
                                        "updateSelectedTemplateName",
                                        "updateSelectedPrettierConfig",
                                        "updateOutput",
                                    ],
                                },
                                "Close modal": { target: "Playing" },
                            },
                        },
                        "Creating file tab": {
                            tags: ["file"],
                            on: {
                                "Submit file modal": {
                                    target: "Playing",
                                    actions: [
                                        "createNewFile",
                                        "selectInputTab",
                                        "updateInputEditorValue",
                                        "updateSelectedOpenApiFileName",
                                        "updateSelectedTemplateName",
                                        "updateSelectedPrettierConfig",
                                        "updateOutput",
                                    ],
                                },
                                "Close modal": { target: "Playing" },
                            },
                        },
                    },
                },
            },
        },
        {
            actions: {
                assignEditorRef: assign((ctx, event) => {
                    if (event.name === "input") {
                        return { ...ctx, inputEditor: event.editor };
                    }

                    return { ...ctx, outputEditor: event.editor, monaco: event.monaco };
                }),
                updateUrl: (ctx) => {
                    const activeDocumentIndex = ctx.inputList.findIndex(
                        (file) => file.name === ctx.selectedOpenApiFileName
                    );
                    const activeTemplateIndex = ctx.inputList.findIndex(
                        (file) => file.name === ctx.selectedTemplateName
                    );
                    const activePrettierConfigIndex = ctx.inputList.findIndex(
                        (file) => file.name === ctx.selectedPrettierConfig
                    );

                    let hasUpdated = false;
                    // !=0 means it's not the first tab (which doesn't need to update the url)
                    if (ctx.activeInputIndex) {
                        const activeIndex = match(ctx.activeInputIndex)
                            .with(activeDocumentIndex, () => 0)
                            .with(activeTemplateIndex, () => 1)
                            .with(activePrettierConfigIndex, () => 2)
                            .run();

                        if (activeIndex) {
                            updateUrlWithParam("activeInputIndex", activeIndex);
                        } else {
                            deletingParamInUrl("activeInputIndex");
                        }
                    } else {
                        deletingParamInUrl("activeInputIndex");
                    }

                    try {
                        // are tabs content different from the default ones?
                        if (ctx.inputList[activeDocumentIndex].content !== initialInputList[0].content) {
                            hasUpdated = true;
                            updateUrlWithCompressedString("doc", ctx.inputList[activeDocumentIndex].content);
                        }

                        if (ctx.inputList[activeTemplateIndex].content !== initialInputList[1].content) {
                            hasUpdated = true;
                            updateUrlWithCompressedString("template", ctx.inputList[activeTemplateIndex].content);
                        }

                        if (ctx.inputList[activePrettierConfigIndex].content !== initialInputList[2].content) {
                            hasUpdated = true;
                            updateUrlWithCompressedString("prettier", ctx.inputList[activePrettierConfigIndex].content);
                        }

                        if (hasUpdated) {
                            void navigator.clipboard.writeText(window.location.href).then(() => {
                                toasts.info("Copied URL to clipboard");
                            });
                        } else {
                            toasts.info("Nothing changed");
                        }
                    } catch (error: unknown) {
                        if (error instanceof Error) {
                            toasts.error(error.message);
                        } else {
                            toasts.error("Unknown error");
                        }
                    }
                },
                reset: assign((_ctx) => {
                    resetUrl();
                    return initialContext;
                }),
                updateInputEditorValue: (ctx) => {
                    if (!ctx.inputEditor) return;
                    ctx.inputEditor.setValue(ctx.inputList[ctx.activeInputIndex].content);
                },
                updateInput: assign({
                    inputList: (ctx, event) => {
                        const activeIndex = ctx.activeInputIndex;
                        return updateAtIndex(ctx.inputList, activeIndex, {
                            ...ctx.inputList[activeIndex],
                            content: event.value,
                        });
                    },
                }),
                updateOutput: assign((ctx, event) => {
                    let input;
                    const documentIndex = ctx.inputList.findIndex((item) => item.name === ctx.selectedOpenApiFileName);
                    input = ctx.inputList[documentIndex]?.content ?? "";

                    if (event.type === "Submit file modal") {
                        input = event.tab.content;
                    }

                    if (!input) {
                        return ctx;
                    }

                    const openApiDoc = input.startsWith("{") ? safeJSONParse(input) : safeYAMLParse(input);
                    if (!openApiDoc) {
                        toasts.error("Error while parsing OpenAPI document");
                        return ctx;
                    }

                    const options = ctx.options;
                    let templateContext: ReturnType<typeof getZodClientTemplateContext>;
                    try {
                        templateContext = getZodClientTemplateContext(openApiDoc, options);
                    } catch (error: unknown) {
                        toasts.error("Something unexpected happened, check the console for more details", {
                            duration: 3000,
                        });
                        console.error(error);
                        return ctx;
                    }

                    // logs the template context to the browser console so users can explore it
                    if (typeof window !== "undefined") {
                        console.log({ templateContext, options, openApiDoc });
                    }

                    const hbs = getHandlebars();
                    const templateTab = ctx.inputList.find((item) => item.name === ctx.selectedTemplateName);

                    const templateString =
                        ctx.presetTemplates[
                            presetTemplateList.find((preset) => preset.preset === ctx.selectedTemplateName)?.template ??
                                ""
                        ] ??
                        templateTab?.content ??
                        "";

                    if (!templateString) return ctx;
                    const template = hbs.compile(templateString);
                    const prettierConfig = safeJSONParse<PrettierOptions>(
                        ctx.inputList.find((tab) => tab.name === ctx.selectedPrettierConfig)?.content ?? "{}"
                    );

                    // adapted from lib/src/generateZodClientFromOpenAPI.ts:60-120
                    if (options.groupStrategy.includes("file")) {
                        const outputByGroupName: Record<string, string> = {};

                        const groupNames = Object.fromEntries(
                            Object.keys(templateContext.endpointsGroups).map((groupName) => [
                                `${capitalize(groupName)}Api`,
                                groupName,
                            ])
                        );

                        const indexTemplate = hbs.compile(ctx.presetTemplates["template-grouped-index"]);
                        const indexOutput = maybePretty(indexTemplate({ groupNames }), prettierConfig);
                        outputByGroupName.index = indexOutput;

                        const commonTemplate = hbs.compile(ctx.presetTemplates["template-grouped-common"]);
                        const commonSchemaNames = [...(templateContext.commonSchemaNames ?? [])];

                        if (commonSchemaNames.length > 0) {
                            const commonOutput = maybePretty(
                                commonTemplate({
                                    schemas: pick(templateContext.schemas, commonSchemaNames),
                                    types: pick(templateContext.types, commonSchemaNames),
                                }),
                                prettierConfig
                            );
                            outputByGroupName.common = commonOutput;
                        }

                        for (const groupName in templateContext.endpointsGroups) {
                            const groupOutput = template({
                                ...templateContext,
                                ...templateContext.endpointsGroups[groupName],
                                options: {
                                    ...options,
                                    groupStrategy: "none",
                                    apiClientName: `${capitalize(groupName)}Api`,
                                },
                            });
                            outputByGroupName[groupName] = maybePretty(groupOutput, prettierConfig);
                        }

                        const outputList = Object.entries(outputByGroupName).map(([name, content], index) => ({
                            name: name + ".ts",
                            content,
                            index,
                        })) as FileTabData[];

                        const monaco = ctx.monaco;
                        if (monaco) {
                            outputList.forEach((tab) => {
                                const uri = new monaco.Uri().with({ path: tab.name });
                                if (!monaco.editor.getModel(uri)) {
                                    monaco.editor.createModel(tab.content, "typescript", uri);
                                }
                            });
                        }

                        if (ctx.outputEditor) {
                            ctx.outputEditor.setValue(outputList[0].content);
                        }

                        return {
                            ...ctx,
                            outputList,
                            activeOutputIndex: 0,
                            activeOutputTab: outputList[0].name,
                        };
                    }

                    const output = template({ ...templateContext, options });
                    const prettyOutput = maybePretty(output, prettierConfig);

                    if (ctx.outputEditor) {
                        ctx.outputEditor.setValue(prettyOutput);
                    }

                    return {
                        ...ctx,
                        templateContext,
                        outputList: [{ name: initialOuputTab, content: prettyOutput, index: 0 }],
                    };
                }),
                selectInputTab: assign({
                    activeInputTab: (_ctx, event) => event.tab.name,
                    activeInputIndex: (ctx, event) => ctx.inputList.findIndex((tab) => tab.name === event.tab.name),
                }),
                updateSelectedOpenApiFileName: assign({
                    selectedOpenApiFileName: (ctx, event) => {
                        if (event.type === "Remove file") {
                            const nextIndex = ctx.inputList.findIndex((tab) => isValidDocumentName(tab.name));
                            return nextIndex === -1 ? ctx.selectedOpenApiFileName : ctx.inputList[nextIndex].name;
                        }

                        if (!event.tab.content) return ctx.selectedOpenApiFileName;

                        const nextIndex = ctx.inputList.findIndex((tab) => tab.name === event.tab.name);
                        if (nextIndex === -1) return ctx.selectedOpenApiFileName;

                        if (!isValidDocumentName(ctx.inputList[nextIndex].name)) {
                            return ctx.inputList.find((tab) => isValidDocumentName(tab.name))?.name ?? "";
                        }

                        return event.tab.name;
                    },
                }),
                updateSelectedTemplateName: assign({
                    selectedTemplateName: (ctx, event) => {
                        if (event.type === "Remove file") {
                            const nextIndex = ctx.inputList.findIndex((tab) => isValidTemplateName(tab.name));
                            return nextIndex === -1 ? ctx.selectedTemplateName : ctx.inputList[nextIndex].name;
                        }

                        if (!event.tab.content) return ctx.selectedTemplateName;

                        const nextIndex = ctx.inputList.findIndex((tab) => tab.name === event.tab.name);
                        if (nextIndex === -1) return ctx.selectedTemplateName;

                        if (!isValidTemplateName(ctx.inputList[nextIndex].name)) {
                            return ctx.inputList.find((tab) => isValidTemplateName(tab.name))?.name ?? "";
                        }

                        return event.tab.name;
                    },
                }),
                updateSelectedPrettierConfig: assign({
                    selectedPrettierConfig: (ctx, event) => {
                        if (event.type === "Remove file") {
                            const nextIndex = ctx.inputList.findIndex((tab) => isValidPrettierConfig(tab.name));
                            return nextIndex === -1 ? ctx.selectedPrettierConfig : ctx.inputList[nextIndex].name;
                        }

                        if (!event.tab.content) return ctx.selectedPrettierConfig;

                        const nextIndex = ctx.inputList.findIndex((tab) => tab.name === event.tab.name);
                        if (nextIndex === -1) return ctx.selectedPrettierConfig;

                        if (!isValidPrettierConfig(ctx.inputList[nextIndex].name)) {
                            return ctx.inputList.find((tab) => isValidPrettierConfig(tab.name))?.name ?? "";
                        }

                        return event.tab.name;
                    },
                }),
                updateSelectedDocOrTemplate: assign((ctx) => {
                    const tab = ctx.inputList[ctx.activeInputIndex];

                    return {
                        ...ctx,
                        selectedOpenApiFileName: isValidDocumentName(tab.name) ? tab.name : ctx.selectedOpenApiFileName,
                        selectedTemplateName: isValidTemplateName(tab.name) ? tab.name : ctx.selectedTemplateName,
                    };
                }),
                selectOutputTab: assign({
                    activeOutputTab: (_ctx, event) => event.tab.name,
                    activeOutputIndex: (ctx, event) => ctx.outputList.findIndex((tab) => tab.name === event.tab.name),
                }),
                selectPresetTemplate: assign({
                    selectedPresetTemplate: (_ctx, event) => event.presetTemplate.preset,
                    inputList: (ctx, event) => {
                        const content = ctx.presetTemplates[event.presetTemplate.template];
                        if (!content) return ctx.inputList;

                        const presetTemplateIndex = ctx.inputList.findIndex(
                            (tab) => tab.preset && isValidTemplateName(tab.name)
                        );
                        if (presetTemplateIndex === -1) return ctx.inputList;

                        return updateAtIndex(ctx.inputList, presetTemplateIndex, {
                            ...ctx.inputList[presetTemplateIndex],
                            content,
                            preset: event.presetTemplate.preset,
                        });
                    },
                    options: (ctx, event) => {
                        if (!event.presetTemplate.options) return ctx.options;

                        return { ...ctx.options, ...event.presetTemplate.options };
                    },
                }),
                initFileForm: assign({
                    fileForm: (ctx) => ({ name: "", content: "", index: ctx.inputList.length }),
                }),
                assignFileToForm: assign({ fileForm: (_ctx, event) => event.tab }),
                removeFile: assign((ctx, event) => {
                    const index = event.tab.index;
                    const next = removeAtIndex(ctx.inputList, index);
                    const isCurrentActive = ctx.activeInputIndex === index;
                    if (!isCurrentActive) {
                        return { ...ctx, inputList: next };
                    }

                    const nextIndex = limit(index, [0, next.length - 1]);

                    return {
                        ...ctx,
                        inputList: next,
                        activeInputTab: next[nextIndex].name,
                        activeInputIndex: nextIndex,
                    };
                }),
                updatePreviewOptions: assign({ previewOptions: (_ctx, event) => event.options }),
                resetPreviewOptions: assign({
                    previewOptions: (_ctx) => defaultOptionValues,
                    optionsFormKey: (ctx) => ctx.optionsFormKey + 1,
                }),
                updateOptions: assign({
                    options: (_ctx, event) => event.options,
                    previewOptions: (_ctx, event) => event.options,
                }),
                updateEditingFile: assign({
                    inputList: (ctx, event) => updateAtIndex(ctx.inputList, ctx.fileForm.index, event.tab),
                }),
                createNewFile: assign({
                    inputList: (ctx, event) => [...ctx.inputList, event.tab],
                }),
            },
            guards: {
                willInputAndOutputEditorBothBeReady: (ctx) => Boolean(ctx.inputEditor ?? ctx.outputEditor),
                isNextTabAnotherOpenApiDoc: (ctx, event) => {
                    if (event.tab.name === ctx.selectedOpenApiFileName) return false;

                    const nextIndex = ctx.inputList.findIndex((tab) => tab.name === event.tab.name);
                    return isValidDocumentName(ctx.inputList[nextIndex].name);
                },
                isNextTabAnotherTemplate: (ctx, event) => {
                    if (event.tab.name === ctx.selectedTemplateName) return false;

                    const nextIndex = ctx.inputList.findIndex((tab) => tab.name === event.tab.name);
                    return isValidTemplateName(ctx.inputList[nextIndex].name);
                },
                isNextTabAnotherPrettierConfig: (ctx, event) => {
                    if (event.tab.name === ctx.selectedPrettierConfig) return false;

                    const nextIndex = ctx.inputList.findIndex((tab) => tab.name === event.tab.name);
                    return isValidPrettierConfig(ctx.inputList[nextIndex].name);
                },
                wasInputEmpty: (ctx, event) => {
                    return Boolean(ctx.inputList[ctx.activeInputIndex].content.trim() === "" && event.value);
                },
            },
        }
    );

export const [PlaygroundMachineProvider, usePlaygroundContext] =
    createContextWithHook<InterpreterFrom<typeof playgroundMachine>>("PlaygroundMachineContext");
