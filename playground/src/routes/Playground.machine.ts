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
import { PresetTemplate, presetTemplateList } from "./Playground.consts";

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
    | { type: "Select preset template"; template: PresetTemplate }
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
    | { type: "Update monaco settings" }
    | { type: "Submit file modal"; tab: FileTabData }
    | { type: "Close modal" }
    | { type: "Resize"; context: ResizablePanesContext };

const initialInputList = [
    { name: "api.doc.yaml", content: presets.defaultInput, index: 0, preset: "petstore.yaml" },
    { name: "template.hbs", content: presets.defaultTemplate, index: 1, preset: presetTemplateList[0].value },
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
    /** @xstate-layout N4IgpgJg5mDOIC5QAcA2BDAnlATgewFcA7CAOlT3QgEsioBiAURoBc8cACAGUokgG0ADAF1EKPLGotqeImJAAPRAFoAHAEYAbKQDsAJgAsmzQFYAnJoDMJweYA0ITIgNmDpA4L0bXqgzvM6lgC+QQ5oWLiEJOS8tAzMUuzcvALqokggyBJSMnIZSgjK6oKqZqRm6qomqt4Glv4GDk4IJnrqulV6gSVaqpp6IWEY2PjEZDhgVJikAArDcfQQsmCktABueADWK+EjUeOTENNzWHEI63gAxujSskLC9-JZkrd5oAWWtrpdJi46FZZLHpLJomoh1OoTCZSKodH0DCZPrD-ppBplhpExqQJlNZvM6PQAKrICA3MAcWjIAgsR4ZZ45WTyArqAyqUiCdR6aqCEFeYzAsEIdRA9rAvQcnn6CF+NG7THRHFHPGnAkAZTAqDAlxYFKIVJ1LHQACNaeIXrkmYh6to+hUEZYzDoWTVBWYLLodJpBGYanorP1ZRjRgrDsd8Qx1Zrtbr9RxDSa0k9sq9LQhPYJSF4LBDfiZ-FZXe6dJ7Of8kYJNKpAxFgwdcSdMAtI1qdYQWLH46bMsmLflwao9LooWYTF6vII-KDHIg3Wz9F1-izXMZgqF0TX9tjQ8rG2qNS2OMgJrAwAawABbcIsMBd+kpvsITSs9kGAyGTT+VTe36CzmuGFwsWbrqMWIGrkMG5YoqYYqgwADyyBgEQHB4MgrywLePaMg+RQeOyno6AipjqG6-y-lY7SCJ4Bi9CUCKOtWexQduDYLAhSGHhMLDSGAnCXLIABm1BQJh5rYe8KggWUtimC44p5pyPK-vUg6fE6lYgoIxYmIx8p1kqrEEuxyHnrI6D8RwJ7cXEGEiEmYlvIokmwqQ-SVn4rQ+rCPq-lUZRZqolh+FoE48rptZbvW4b0AAghAEAcEJmqiQyjkFMohgZnoFQlBoJGBJ6v48myDrAkCFhupYLLhZu0E7gsCQ6klN52XSWFpSo-iWDCjq8kBEKuK6b74V0X7GKUfTqDVzFRbB9AAEoXngazks1KX3hJCBVdCrLCl+u1+o005CoC0JmJ4gJwhoXokdNIa4o1cQoWhuSwESJJkpxYBrNQYAAO7Peh629ptyiVtoxbBR+1gFeov4BK5Zg-EF5iOgYd36dMj10IDr0LXAp5fT9-247ItnpGaqWpsol3slp2XbV4xY6PDLKkK0eicyBdS+joGORUq2NQKTRBvaq6ArSL5P2VTOF+IOnJaP02VPpolRTs0IGmOynwcl4rSApU-N1ULUv0AAwhQJ5S8D4lOYUXhuJYVQroBzomL+hE6OzEKwhy13GOja5yhFJusE9R6njxfGCcJ72kteX3WbxHD8UQQkia1lMbfbYMIu4NEaYbQKWMpz4aDUJick+LITsb26m5Hycx+nceWxI5KmaSqC2x1hTO2UIIaFRo5vsPGvgq+0nnSCSNVzyo71w94c46ZRDmXgllRzZFtW53eDd731M0d1bRlVo-x8j+x0kTYrleEFskkaRS+CyvwvNXGxr0KqBBGueUhErUE1BwLu6Ae5Z27A5amxQBzlH8DYKuvtCKCkCG4KocIfDeTqAMYOQZaoN3fkAkB8Zd4d1AQfcBR8cKIm9k6cUJQvR5kdCzY6A42RM2qFCD8sJISv2mObHE0gcaf1Ib-f+gDP5gIgRTKBstQYuDKMKT0XpKwVF8CyV0WhSDCjqFXN0OUgr8NIIIyYwiP7APJKQ9u1tpHUNBlyGEthKh+kXJ8KqroPzszdOKHQWlXxaQxvjSQAAvFqsi7wg1ztmXQlY2iaDMECAcE8EBcnaAkx0xQ2i5hcKiNERAD5wCePgrEFAqBxBljndKEJKgdGok6JGH4jrNDqN1Ec2U-F1D+CyPJEEmL3QMuGSpUSCg1FICCYwcJxQeAdEYX80zyhBU+Nlb0mTenrn6ZjUgptULoWGXbdKHhoQkU+LJQKgRKjkTaDo4eDoahLL6MYxuXFo6p1jlAfZfdlBvkHFCXoVdRz6BKB7G+KlxlaWKH4lkej1khwIcvHIq8zIWSsuY+AbVoFy1KK5fQQIaJaBBJCEFms+glTFLCU6XQzBPKIaI40nzqaESyrip0HkeTO0FIFaETDfhwnMDUWExjTE3CenSo0DKcKGDcCySEVEKzO2sJ472qNgSQ38Co-hErQYQk+PAqEzjkHNMQE+aEGDShPg5COT0GMtW5whHCPViCamwiNVtV85RPJ9BsIpAcIQQhAA */
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
                                    { actions: ["selectInputTab", "updateSelectedTemplateName", "updateOutput"] },
                                ],
                                "Select output tab": { actions: "selectOutputTab" },
                                "Select preset template": { actions: ["selectPresetTemplate", "updateOutput"] },
                                "Open options": { target: "Editing options" },
                                "Open prettier config": { target: "Editing prettier config" },
                                "Open monaco settings": { target: "Editing monaco settings" },
                                "Add file": { target: "Creating file tab", actions: "initFileForm" },
                                "Edit file": { target: "Editing file tab", actions: "assignFileToForm" },
                                "Remove file": {
                                    actions: [
                                        "removeFile",
                                        "updateSelectedOpenApiFileName",
                                        "updateSelectedTemplateName",
                                        "updateOutput",
                                    ],
                                },
                                // TODO
                                // Save: { actions: "save" },
                                // Share: { actions: ["save", "copyUrlToClipboard"] },
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
                                        "updateSelectedTemplateName",
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

                    const hbs = getHandlebars();
                    const templateString = match(ctx.selectedTemplateName)
                        .with(initialInputList[1].preset, () => initialInputList[1].content)
                        .otherwise(() => {
                            return (
                                ctx.presetTemplates[
                                    presetTemplateList.find((preset) => preset.value === ctx.selectedTemplateName)
                                        ?.template ?? ""
                                ] ??
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

                        const nextIndex = ctx.inputList.findIndex((tab) => tab.name === event.tab.name);
                        if (nextIndex === -1) return ctx.selectedOpenApiFileName;

                        return isValidDocumentName(ctx.inputList[nextIndex].name)
                            ? event.tab.name
                            : ctx.inputList.find((tab) => isValidDocumentName(tab.name))?.name ?? "";
                    },
                }),
                updateSelectedTemplateName: assign({
                    selectedTemplateName: (ctx, event) => {
                        if (!event.tab.content) return ctx.selectedTemplateName;

                        const nextIndex = ctx.inputList.findIndex((tab) => tab.name === event.tab.name);
                        if (nextIndex === -1) return ctx.selectedTemplateName;

                        return ctx.inputList[nextIndex].name.endsWith(".hbs")
                            ? event.tab.name
                            : ctx.selectedTemplateName;
                    },
                }),
                selectOutputTab: assign({
                    activeOutputTab: (_ctx, event) => event.tab.name,
                    activeOutputIndex: (ctx, event) => ctx.outputList.findIndex((tab) => tab.name === event.tab.name),
                }),
                selectPresetTemplate: assign({
                    selectedTemplateName: (_ctx, event) => event.template.value,
                    inputList: (ctx, event) => {
                        const content = ctx.presetTemplates[event.template.template];
                        if (!content) return ctx.inputList;

                        const currentTemplateIndex = ctx.inputList.findIndex(
                            (tab) => tab.preset === ctx.selectedTemplateName
                        );
                        if (currentTemplateIndex === -1) return ctx.inputList;

                        return updateAtIndex(ctx.inputList, currentTemplateIndex, {
                            ...ctx.inputList[currentTemplateIndex],
                            content,
                            preset: event.template.value,
                        });
                    },
                    options: (ctx, event) => {
                        if (!event.template.options) return ctx.options;

                        return { ...ctx.options, ...event.template.options };
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
