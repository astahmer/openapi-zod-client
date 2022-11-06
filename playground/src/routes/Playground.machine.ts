import { editor } from "monaco-editor";
import { getHandlebars, getZodClientTemplateContext, maybePretty, TemplateContext } from "openapi-zod-client";
import { assign, createMachine, InterpreterFrom } from "xstate";
import { Options as PrettierOptions } from "prettier";
import { ResizablePanesContext } from "../components/SplitPane/SplitPane.machine";
import { AwaitFn, createContextWithHook, limit, removeAtIndex, safeJSONParse, updateAtIndex } from "pastable";
import { defaultOptionValues, OptionsFormValues } from "../components/OptionsForm";
import { presets } from "./presets";
import { parse } from "yaml";
import { match } from "ts-pattern";

export type FileTabData = { name: string; content: string; index: number; preset?: string };

type PlaygroundContext = {
    inputEditor: editor.IStandaloneCodeEditor | null;
    outputEditor: editor.IStandaloneCodeEditor | null;

    options: OptionsFormValues;
    previewOptions: OptionsFormValues;
    optionsFormKey: number;

    templateContext: TemplateContext | null;
    output: string;

    activeInputTab: string;
    activeInputIndex: number;
    inputList: FileTabData[];

    activeOutputTab: string;
    activeOutputIndex: number;
    outputList: FileTabData[];

    selectedOpenApiFileName: string;
    selectedTemplateName: string;
    presetTemplates: Record<string, string>;

    fileForm: FileTabData;
};

type PlaygroundEvent =
    | { type: "Editor Loaded"; editor: editor.IStandaloneCodeEditor; name: "input" | "output" }
    | { type: "Update input"; value: string }
    | { type: "Select input tab"; tab: FileTabData }
    | { type: "Select output tab"; tab: FileTabData }
    | { type: "Select preset template"; name: string }
    | { type: "Open options" }
    | { type: "Close options" }
    | { type: "Open prettier config" }
    | { type: "Open monaco settings" }
    | { type: "Add file" }
    | { type: "Edit file"; tab: FileTabData }
    | { type: "Remove file"; tab: FileTabData }
    | { type: "Save" }
    | { type: "Share" }
    | { type: "Update preview options"; options: OptionsFormValues }
    | { type: "Reset preview options" }
    | { type: "Save options"; options: OptionsFormValues }
    | { type: "Update prettier config"; options: PrettierOptions }
    | { type: "Update monaoc settings" }
    | { type: "Submit file modal"; tab: FileTabData }
    | { type: "Close modal" }
    | { type: "Resize"; context: ResizablePanesContext };

const initialInputList = [
    { name: "api.doc.yaml", content: presets.defaultInput, index: 0, preset: "petstore.yaml" },
    { name: "template.hbs", content: presets.defaultTemplate, index: 1, preset: "template-default" },
    {
        name: ".prettierrc.json",
        content: JSON.stringify(presets.defaultPrettierConfig, null, 4),
        index: 2,
        preset: "prettier",
    },
] as const; // TODO as FileTabData[] with ts 4.9 satisfies
const initialOuputTab = "api.client.ts";

const isValidDocumentName = (name: string) =>
    !name.startsWith(".prettier") && (name.endsWith(".yml") || name.endsWith(".yaml") || name.endsWith(".json"));

export const playgroundMachine =
    /** @xstate-layout N4IgpgJg5mDOIC5QAcA2BDAnlATgewFcA7CAOlT3QgEsioBiAURoBc8cACAGUokgG0ADAF1EKPLGotqeImJAAPRAFoAHAEYAbKQDsAJgAsmzQFYAnJoDMJweYA0ITIgNmDpA4L0bXqgzvM6lgC+QQ5oWLiEJOS8tAzMUuzcvALqokggyBJSMnIZSgjK6oKqZqRm6qomqt4Glv4GDk4IJnrqulV6gSVaqpp6IWEY2PjEZDhgVJikAArDcfQAqsgQ6CxgHLTIBCxC6eKS0rLyBXqWpCYeJpd9llXqel1NiOrqZqqkluo6lWaCOoIzDYdINMsNImNSBMprN5nR6ABlMCoMAAYxYmyI2wxLHQACM9vIsodcicXucdC53p0DFozF49M8EMVLGV+q0Kr4gd8QaEwRFRtFoRBpnMsAskSj0RxCCxsRxcQSRETskc8qACuoTO4ul5NDpNKoSqo7kzXIJSHpBEZfNdTFTQeERlFxpMRbDxfCAPLIMBEGXINWwQkZYk5Y75FSPNx-Syskz1AFnMw6Jla-ykf4-HSlYyCL4GR3gwWumFizALH1+jjICYsaRgTio2QAM2oUBDB3D6sUUaspBqX3eZks-zu6jTX2045Htkqlj8RYFLqhbtFcIYVf9AFtZOhmxxYGB63Fg8rQ6rSZHCrr3AmXPpLhUrmmjedLJoDOZDYFNA9gnyToQkKa4ehW8IAIIQBAHBtiinaZJeEYaiolh6Nqrw6IEOYGH4Vj6maqh6O4+qAiYDz+PmAyAcWK7CuunrxKwsHUPB55dmqZKFCaHz6B4Dw2LSX6NI4iA1No6h+JcDKmCYOZLs6kL0WBCwAEpgLuABuGxwWACFhpx15xhcH6fq4Py0oYZiTno2hdOYvimDSvJDMuSmgQk0h0AGQZLCsawbLWYCadQYAAO4+bkZ77IhJLIb2hRYe0miCOoplGP8ViMqJzKXO0Br+Fqf4NNUCnAaW7qeXEkWyLA9DqUeGJBSF4U1UQ0UqnFPYFMoBhtAOcauF4WGxqoaZfh837vKyqXCSYZUlquMJVd5eCBlFiLoNpbUdReXVccodrlAYJoPJ4kmqDo1k5d8gKkMUfiUYCsbzTRbkgctrDVWtvkAMIUEeO36Uh3WoZoZRtGcaXkW0lLXGm4PtNUxhoYNZwmgtdEeV93lBSejYcM2RBtgwyyrOsNZ1g2Tatu2wP7deyjdJahpxqOJhWC4E43Xo9IDiOf4LrDDyFm9ikfZVONQJTx7U4TtMMP9EgbLuqyoPT3YHX4bhvFJnilKOFmTiO92mGlkklCl-iY+5n05N5u5EPueCHrLp70ErgOq+g6vsbFmuMy4Hz5qUGgeHUDyaK+ri6PmxR9GYQLZjbEvTCt0u6Qq+KIgQeLblILEohw3u+zFBlXihhTFMY92SSdT7mK8InNPoHxtJcT59UVqgpxVadS4XGyKh7AMq3gasa4ZlfKP0xEJn01RxiU6NMlhxEfmcj3obhaG90t7q-dCXkZ6xQ-Zwiuf5ximcl5PFcJYdJrlJ+XzWpJbSeEyfQWlaFSSUV+pyJ72UofSYx9B5ZzxCPZWxdx4+zvvFHqrwLRWHnIYN+HNaRmleKQfUrJwZQxTJdXu9U4DUAAF56T9uXRBKgLD5UNG0cGaEiJRxyuhZKicfjnQ7i4TQIQ+REHHnAIktFIQUCoHETqAdp6vEqB0Twfg3i2UpEyOo5wgS8wBHUB8kl+Fi3KvvBi4EoDSKng-HMz83gVFsI3FMqYbp6PcFoK0p0ATXGoq5cWfdSDpx2mY++PUXAWlSimLUrj-BXTTBzbU6FqieDfqla0wDsb22lnjOWRMSYBNoYUYEnwcxxhOhoSkDjmjm2nBoBO3wrSZRSXbcBjtnauxPHQeAe0ZEPzkm4IOKY7i0juAaV8DxPjvGtK4ekVQSj1MlmkiBiocmg24uhTMidzq1NsO8VeV1cFvmKKlSkKVRZeMMSAo+1VM4LI6eYnqLDn5hyIeJYoZTEB-1wYEROazyInQAicxa9FFkHTkTrOuVQXCN0kkyKwEMtR1A4SlZ6vdAWM1eDXHMiifj0n1M3RAC4YwciNM88wKYBFBCAA */
    createMachine(
        {
            predictableActionArguments: true,
            id: "playground",
            tsTypes: {} as import("./Playground.machine.typegen").Typegen0,
            schema: {
                context: {} as PlaygroundContext,
                events: {} as PlaygroundEvent,
            },
            context: {
                inputEditor: null,
                outputEditor: null,
                options: defaultOptionValues,
                previewOptions: defaultOptionValues,
                optionsFormKey: 0,
                templateContext: null,
                output: "",
                activeInputTab: initialInputList[0].name,
                activeInputIndex: 0,
                inputList: initialInputList as any as FileTabData[], // TODO rm with ts 4.9 satisfies
                selectedOpenApiFileName: initialInputList[0].name,
                selectedTemplateName: initialInputList[1].preset,
                presetTemplates: {},
                activeOutputTab: initialOuputTab,
                activeOutputIndex: 0,
                outputList: [{ name: initialOuputTab, content: "", index: 0 }],
                fileForm: { name: "", content: "", index: -1 },
            },
            initial: "loading",
            states: {
                loading: {
                    on: {
                        "Editor Loaded": [
                            {
                                target: "ready",
                                actions: ["assignEditorRef", "updateOutput"],
                                cond: "willInputAndOutputEditorBothReady",
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
                                "Update input": { actions: ["updateInput", "updateOutput"] },
                                "Select input tab": [
                                    {
                                        actions: ["selectInputTab", "updateSelectedOpenApiFileName", "updateOutput"],
                                        cond: "isNextTabAnotherOpenApiDoc",
                                    },
                                    { actions: "selectInputTab" },
                                ],
                                "Select output tab": { actions: "selectOutputTab" },
                                "Select preset template": { actions: ["selectPresetTemplate", "updateOutput"] },
                                "Open options": { target: "Editing options" },
                                "Open prettier config": { target: "Editing prettier config" },
                                "Open monaco settings": { target: "Editing monaco settings" },
                                "Add file": { target: "Creating file tab", actions: "initFileForm" },
                                "Edit file": { target: "Editing file tab", actions: "assignFileToForm" },
                                "Remove file": {
                                    actions: ["removeFile", "updateSelectedOpenApiFileName", "updateOutput"],
                                },
                                // TODO
                                // Save: { actions: "save" },
                                // Share: { actions: ["save", "copyUrlToClipboard"] },
                            },
                            invoke: {
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
                        "Editing prettier config": {
                            on: {
                                "Update prettier config": { actions: ["updatePrettierConfig", "updateOutput"] },
                                "Close modal": { target: "Playing" },
                            },
                        },
                        "Editing monaco settings": {
                            on: {
                                // TODO
                                // "Update prettier config": { actions: "updatePrettierConfig" },
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
                                        "updateOutput",
                                    ],
                                },
                                "Close modal": { target: "Playing" },
                            },
                        },
                    },
                },
            },
            on: {
                Resize: { actions: "resize" },
            },
        },
        {
            actions: {
                assignEditorRef: assign((ctx, event) => {
                    if (event.name === "input") {
                        return { ...ctx, inputEditor: event.editor };
                    }

                    return { ...ctx, outputEditor: event.editor };
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

                    const openApiDoc = input.startsWith("{") ? safeJSONParse(input) : parse(input);
                    if (!openApiDoc) return ctx;

                    const templateContext = getZodClientTemplateContext(openApiDoc, ctx.options);
                    // logs the template context to the browser console so users can explore it
                    if (typeof window !== "undefined") {
                        console.log({ templateContext, options: ctx.options, openApiDoc });
                    }

                    const groupStrategy = ctx.options?.groupStrategy ?? "none";

                    const hbs = getHandlebars();
                    const templateString = match(ctx.selectedTemplateName)
                        .with(initialInputList[1].preset, () => initialInputList[1].content)
                        .otherwise(() => {
                            return (
                                ctx.presetTemplates[ctx.selectedTemplateName] ??
                                ctx.inputList.find((tab) => tab.name === ctx.selectedTemplateName)?.content ??
                                ""
                            );
                        });
                    if (!templateString) return ctx;
                    const template = hbs.compile(templateString);

                    const output = template({ ...templateContext, options: ctx.options });
                    const prettyOutput = maybePretty(output, presets.defaultPrettierConfig);

                    if (ctx.outputEditor) {
                        ctx.outputEditor.setValue(prettyOutput);
                    }

                    return {
                        ...ctx,
                        templateContext,
                        output: prettyOutput,
                    };
                }),
                selectInputTab: assign({
                    activeInputTab: (_ctx, event) => event.tab.name,
                    activeInputIndex: (ctx, event) => ctx.inputList.findIndex((tab) => tab.name === event.tab.name),
                }),
                updateSelectedOpenApiFileName: assign({
                    selectedOpenApiFileName: (ctx, event) => {
                        if (!event.tab.content) return ctx.selectedOpenApiFileName;

                        const activeIndex = ctx.inputList.findIndex((tab) => tab.name === event.tab.name);
                        if (activeIndex === -1) return ctx.selectedOpenApiFileName;

                        return isValidDocumentName(ctx.inputList[activeIndex].name)
                            ? event.tab.name
                            : ctx.inputList.find((tab) => isValidDocumentName(tab.name))?.name ?? "";
                    },
                }),
                selectOutputTab: assign({
                    activeOutputTab: (_ctx, event) => event.tab.name,
                    activeOutputIndex: (ctx, event) => ctx.outputList.findIndex((tab) => tab.name === event.tab.name),
                }),
                selectPresetTemplate: assign({
                    selectedTemplateName: (ctx, event) => event.name,
                    inputList: (ctx, event) => {
                        const content = ctx.presetTemplates[event.name];
                        if (!content) return ctx.inputList;

                        const templateIndex = ctx.inputList.findIndex((tab) => tab.preset === ctx.selectedTemplateName);
                        if (templateIndex === -1) return ctx.inputList;

                        return updateAtIndex(ctx.inputList, templateIndex, {
                            ...ctx.inputList[templateIndex],
                            content,
                            preset: event.name,
                        });
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
                updatePrettierConfig: assign({
                    options: (ctx, event) => ({ ...ctx.options, prettier: event.options }),
                }),
                updateEditingFile: assign({
                    inputList: (ctx, event) => updateAtIndex(ctx.inputList, ctx.fileForm.index, event.tab),
                }),
                createNewFile: assign({
                    inputList: (ctx, event) => [...ctx.inputList, event.tab],
                }),
                resize: (ctx, event) => {
                    if (!ctx.outputEditor) return;
                    ctx.outputEditor.layout({
                        width: event.context.containerSize - event.context.draggedSize,
                        height: ctx.outputEditor.getLayoutInfo().height,
                    });
                },
            },
            guards: {
                willInputAndOutputEditorBothReady: (ctx) => Boolean(ctx.inputEditor ?? ctx.outputEditor),
                isNextTabAnotherOpenApiDoc: (ctx, event) => {
                    if (event.tab.name === ctx.selectedOpenApiFileName) return false;

                    const nextIndex = ctx.inputList.findIndex((tab) => tab.name === event.tab.name);
                    return isValidDocumentName(ctx.inputList[nextIndex].name);
                },
            },
        }
    );

export const [PlaygroundMachineProvider, usePlaygroundContext] =
    createContextWithHook<InterpreterFrom<typeof playgroundMachine>>("PlaygroundMachineContext");
