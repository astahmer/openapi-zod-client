import { editor } from "monaco-editor";
import {
    getHandlebars,
    getZodClientTemplateContext,
    maybePretty,
    TemplateContext,
    TemplateContextOptions,
} from "openapi-zod-client";
import { assign, createMachine, InterpreterFrom } from "xstate";
import { Options as PrettierOptions } from "prettier";
import { ResizablePanesContext } from "../components/SplitPane/SplitPane.machine";
import { createContextWithHook, limit, removeAtIndex, safeJSONParse, updateAtIndex } from "pastable";
import { defaultOptionValues } from "../components/OptionsForm";
import { presets } from "./presets";
import { parse } from "yaml";

type FileTab = { name: string; content: string; index: number; preset?: string };

type PlaygroundContext = {
    inputEditor: editor.IStandaloneCodeEditor | null;
    outputEditor: editor.IStandaloneCodeEditor | null;

    options: TemplateContextOptions;
    previewOptions: TemplateContextOptions;
    optionsFormKey: number;

    templateContext: TemplateContext | null;
    output: string;

    activeInputTab: string;
    activeInputIndex: number;
    inputList: FileTab[];

    activeOutputTab: string;
    activeOutputIndex: number;
    outputList: FileTab[];

    fileForm: FileTab;
};

type PlaygroundEvent =
    | { type: "Editor Loaded"; editor: editor.IStandaloneCodeEditor; name: "input" | "output" }
    | { type: "Update input"; value: string }
    | { type: "Select input tab"; tab: FileTab }
    | { type: "Select output tab"; tab: FileTab }
    | { type: "Open options" }
    | { type: "Close options" }
    | { type: "Open prettier config" }
    | { type: "Add file" }
    | { type: "Edit file"; tab: FileTab }
    | { type: "Remove file"; tab: FileTab }
    | { type: "Save" }
    | { type: "Share" }
    | { type: "Update preview options"; options: TemplateContextOptions }
    | { type: "Reset preview options" }
    | { type: "Save options"; options: TemplateContextOptions }
    | { type: "Update prettier config"; options: PrettierOptions }
    | { type: "Submit file modal"; tab: FileTab }
    | { type: "Close file modal" }
    | { type: "Resize"; context: ResizablePanesContext };

const initialInputList: FileTab[] = [
    { name: "api.doc.yaml", content: presets.defaultInput, index: 0, preset: "Petstore" },
    { name: "template.hbs", content: presets.defaultTemplate, index: 1, preset: "Default (zodios)" },
];
const initialOuputTab = "api.client.ts";
const isValidDocumentName = (name: string) => name.endsWith(".yml") || name.endsWith(".yaml") || name.endsWith(".json");

export const playgroundMachine = createMachine(
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
            inputList: initialInputList,
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
                            "Select input tab": { actions: "selectInputTab" },
                            "Select output tab": { actions: "selectOutputTab" },
                            "Open options": { target: "Editing options" },
                            "Open prettier config": { target: "Editing prettier config" },
                            "Add file": { target: "Creating file tab", actions: "initFileForm" },
                            "Edit file": { target: "Editing file tab", actions: "assignFileToForm" },
                            "Remove file": { actions: "removeFile" },
                            // TODO
                            // Save: { actions: "save" },
                            // Share: { actions: ["save", "copyUrlToClipboard"] },
                        },
                    },
                    "Editing options": {
                        on: {
                            "Update preview options": { actions: "updatePreviewOptions" },
                            "Reset preview options": { actions: "resetPreviewOptions" },
                            "Save options": { target: "Playing", actions: "updateOptions" },
                            "Close options": { target: "Playing" },
                        },
                    },
                    "Editing prettier config": {
                        on: {
                            "Update prettier config": { actions: "updatePrettierConfig" },
                        },
                    },
                    "Editing file tab": {
                        tags: ["file"],
                        on: {
                            "Submit file modal": {
                                target: "Playing",
                                actions: ["updateEditingFile", "selectInputTab", "updateInputEditorValue"],
                            },
                            "Close file modal": { target: "Playing" },
                        },
                    },
                    "Creating file tab": {
                        tags: ["file"],
                        on: {
                            "Submit file modal": {
                                target: "Playing",
                                actions: ["createNewFile", "selectInputTab", "updateInputEditorValue"],
                            },
                            "Close file modal": { target: "Playing" },
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
            updateOutput: assign((ctx) => {
                const activeIndex = ctx.activeInputIndex;
                const documentIndex = isValidDocumentName(ctx.inputList[activeIndex].name)
                    ? activeIndex
                    : ctx.inputList.findIndex((tab) => isValidDocumentName(tab.name));
                const input = ctx.inputList[documentIndex]?.content ?? "";

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
                // TODO select template
                const template = hbs.compile(presets.defaultTemplate);

                const output = template({ ...templateContext, options: ctx.options });
                const prettyOutput = maybePretty(output, {
                    printWidth: 120,
                    tabWidth: 4,
                    arrowParens: "always",
                    useTabs: false,
                    semi: true,
                    singleQuote: false,
                    trailingComma: "es5",
                });
                console.log(presets, { input, hbs, template, prettyOutput, options: ctx.options });

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
            selectOutputTab: assign({
                activeOutputTab: (_ctx, event) => event.tab.name,
                activeOutputIndex: (ctx, event) => ctx.outputList.findIndex((tab) => tab.name === event.tab.name),
            }),
            initFileForm: assign({
                fileForm: (ctx) => ({
                    name: "",
                    content: "",
                    index: ctx.inputList.length,
                }),
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
                    activeInputTab: next[nextIndex]!.name,
                    activeInputIndex: nextIndex,
                };
            }),
            updatePreviewOptions: assign({ previewOptions: (_ctx, event) => event.options }),
            resetPreviewOptions: assign({
                previewOptions: (_ctx) => defaultOptionValues as TemplateContextOptions,
                optionsFormKey: (ctx) => ctx.optionsFormKey + 1,
            }),
            updateOptions: assign({ options: (_ctx, event) => event.options }),
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
        },
    }
);

export const [PlaygroundMachineProvider, usePlaygroundContext] =
    createContextWithHook<InterpreterFrom<typeof playgroundMachine>>("PlaygroundMachineContext");
