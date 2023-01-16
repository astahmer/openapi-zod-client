import { useInterpret } from "@xstate/react";
import { Playground } from "./Playground";
import { FileTabData, playgroundMachine, PlaygroundMachineProvider } from "./Playground.machine";
import { getDecompressedStringFromUrl } from "../url-saver";

export const PlaygroundWithMachine = () => {
    const url = new URL(window.location.href);

    const hasDoc = url.searchParams.has("doc");
    const hasTemplate = url.searchParams.has("template");
    const hasPrettier = url.searchParams.has("prettier");

    let initialInputList: undefined | FileTabData[];
    const initialCtx = playgroundMachine.context;

    if (hasDoc || hasTemplate || hasPrettier) {
        initialInputList = [
            {
                name: "api.doc.yaml",
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                content: getDecompressedStringFromUrl("doc") || initialCtx.inputList[0].content,
                index: 0,
                preset: "petstore.yaml",
            },
            {
                name: "template.hbs",
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                content: getDecompressedStringFromUrl("template") || initialCtx.inputList[1].content,
                index: 1,
                preset: initialCtx.inputList[1].content,
            },
            {
                name: ".prettierrc.json",
                content:
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    (getDecompressedStringFromUrl("prettier") ?? "") ||
                    JSON.stringify(initialCtx.inputList[2].content, null, 4),
                index: 2,
                preset: "prettier",
            },
            {
                name: "api.doc.json",
                content:
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    (getDecompressedStringFromUrl("doc-json") ?? "") ||
                    JSON.stringify(initialCtx.inputList[3].content, null, 4),
                index: 3,
                preset: "petstore.json",
            },
        ];
    }

    const activeInputIndex = url.searchParams.get("activeInputIndex");

    const service = useInterpret(
        initialInputList
            ? playgroundMachine.withContext({
                  ...playgroundMachine.context,
                  inputList: initialInputList,
                  selectedOpenApiFileName: initialInputList[0].name,
                  selectedTemplateName: initialInputList[1].name,
                  selectedPrettierConfig: initialInputList[2].name,
                  activeInputIndex: activeInputIndex ? Number(activeInputIndex) : initialCtx.activeInputIndex,
              })
            : playgroundMachine
    );

    return (
        <PlaygroundMachineProvider value={service}>
            <Playground />
        </PlaygroundMachineProvider>
    );
};
