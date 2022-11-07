// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
    "@@xstate/typegen": true;
    internalEvents: {
        "done.invoke.getPresetTemplates": {
            type: "done.invoke.getPresetTemplates";
            data: unknown;
            __tip: "See the XState TS docs to learn how to strongly type this.";
        };
        "xstate.init": { type: "xstate.init" };
    };
    invokeSrcNameMap: {};
    missingImplementations: {
        actions: never;
        services: never;
        guards: never;
        delays: never;
    };
    eventsCausingActions: {
        assignEditorRef: "Editor Loaded";
        assignFileToForm: "Edit file";
        createNewFile: "Submit file modal";
        initFileForm: "Add file";
        removeFile: "Remove file";
        reset: "Reset";
        resetPreviewOptions: "Reset preview options";
        resize: "Resize";
        selectInputTab: "Select input tab" | "Submit file modal";
        selectOutputTab: "Select output tab";
        selectPresetTemplate: "Select preset template";
        updateEditingFile: "Submit file modal";
        updateInput: "Update input";
        updateInputEditorValue: "Submit file modal";
        updateOptions: "Save options";
        updateOutput:
            | "Editor Loaded"
            | "Remove file"
            | "Reset"
            | "Save options"
            | "Select input tab"
            | "Select preset template"
            | "Submit file modal"
            | "Update input";
        updatePreviewOptions: "Update preview options";
        updateSelectedDocOrTemplate: "Update input";
        updateSelectedOpenApiFileName: "Remove file" | "Select input tab" | "Submit file modal";
        updateSelectedPrettierConfig: "Remove file" | "Select input tab" | "Submit file modal";
        updateSelectedTemplateName: "Remove file" | "Select input tab" | "Submit file modal";
        updateUrl: "Save";
    };
    eventsCausingServices: {};
    eventsCausingGuards: {
        isNextTabAnotherOpenApiDoc: "Select input tab";
        isNextTabAnotherPrettierConfig: "Select input tab";
        isNextTabAnotherTemplate: "Select input tab";
        wasInputEmpty: "Update input";
        willInputAndOutputEditorBothBeReady: "Editor Loaded";
    };
    eventsCausingDelays: {};
    matchesStates:
        | "loading"
        | "ready"
        | "ready.Creating file tab"
        | "ready.Editing file tab"
        | "ready.Editing monaco settings"
        | "ready.Editing options"
        | "ready.Playing"
        | {
              ready?:
                  | "Creating file tab"
                  | "Editing file tab"
                  | "Editing monaco settings"
                  | "Editing options"
                  | "Playing";
          };
    tags: "file";
}
