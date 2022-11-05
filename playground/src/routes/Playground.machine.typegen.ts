// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
    "@@xstate/typegen": true;
    internalEvents: {
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
        resetPreviewOptions: "Reset preview options";
        resize: "Resize";
        selectInputTab: "Select input tab" | "Submit file modal";
        selectOutputTab: "Select output tab";
        updateEditingFile: "Submit file modal";
        updateInput: "Update input";
        updateInputEditorValue: "Submit file modal";
        updateOptions: "Save options";
        updateOutput: "Editor Loaded" | "Update input";
        updatePrettierConfig: "Update prettier config";
        updatePreviewOptions: "Update preview options";
    };
    eventsCausingServices: {};
    eventsCausingGuards: {
        willInputAndOutputEditorBothReady: "Editor Loaded";
    };
    eventsCausingDelays: {};
    matchesStates:
        | "loading"
        | "ready"
        | "ready.Creating file tab"
        | "ready.Editing file tab"
        | "ready.Editing options"
        | "ready.Editing prettier config"
        | "ready.Playing"
        | {
              ready?:
                  | "Creating file tab"
                  | "Editing file tab"
                  | "Editing options"
                  | "Editing prettier config"
                  | "Playing";
          };
    tags: "file";
}
