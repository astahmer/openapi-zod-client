import {
    Box,
    Button,
    ButtonProps,
    Code,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    Tab,
    TabList,
    Tabs,
    useClipboard,
    useDisclosure,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import type { TemplateContextOptions } from "openapi-zod-client";
import { getHandlebars, getZodClientTemplateContext, maybePretty } from "openapi-zod-client";
import { safeJSONParse } from "pastable";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { parse } from "yaml";
import { default as petstoreYaml } from "../../../examples/petstore.yaml?raw";
import { default as baseOutputTemplate } from "../../../lib/src/template.hbs?raw";
import { defaultOptionValues, OptionsForm } from "../components/OptionsForm";
import { SplitPane } from "../components/SplitPane/SplitPane";

// TODO: Add a way to pass in a custom template.
// template context explorer
// browse examples
// select samples
// input = getZodSchema
// localStorage persistence for input
// reset btn (= localStorage.clear + input=petstore.yaml)
// TODO diff editor + collect warnings

export const Playground = () => {
    const [options, setOptions] = useState<Partial<TemplateContextOptions>>({});
    const [previewOptions, setPreviewOptions] = useState<Partial<TemplateContextOptions & { booleans: string[] }>>({});
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [input, setInput] = useState<string | undefined>(petstoreYaml);
    const deferredInput = useDeferredValue(input);

    const openApiDoc = useMemo(() => {
        if (!deferredInput) return;
        if (deferredInput.startsWith("{")) {
            return safeJSONParse(deferredInput);
        }

        return parse(deferredInput);
    }, [deferredInput]);

    const ctx = useMemo(() => {
        if (!openApiDoc) return;
        return getZodClientTemplateContext(openApiDoc, options);
    }, [openApiDoc, options]);

    const output = useMemo(() => {
        if (!ctx) return "";
        // TODO
        const groupStrategy = options?.groupStrategy ?? "none";

        const hbs = getHandlebars();
        const template = hbs.compile(baseOutputTemplate);

        const output = template({ ...ctx, options: { ...options, apiClientName: options?.apiClientName ?? "api" } });
        return maybePretty(output, {
            printWidth: 120,
            tabWidth: 4,
            arrowParens: "always",
            useTabs: false,
            semi: true,
            singleQuote: false,
            trailingComma: "es5",
        });
    }, [ctx, options]);

    const [activeFile, setActiveFile] = useState({ name: "api.client.ts", content: output });
    const [files, setFiles] = useState<Array<{ name: string; content: string }>>([activeFile]);
    const monacoRef = useRef<editor.IStandaloneCodeEditor>();

    const relevantOptions = Object.fromEntries(
        Object.entries({
            ...options,
            ...Object.fromEntries((previewOptions.booleans ?? []).map((boolOption) => [boolOption, true])),
        }).filter(
            ([name, value]) =>
                Boolean(value) &&
                name !== "booleans" &&
                value !== defaultOptionValues[name as keyof typeof defaultOptionValues]
        )
    );
    const cliCode = `pnpx openapi-zod-client ./petstore.yaml -o ./${activeFile.name}
    ${Object.entries(relevantOptions).reduce(
        (acc, [optionName, value]) =>
            `${acc} ${optionNameToCliOptionName[optionName as keyof typeof optionNameToCliOptionName]}="${
                value as string
            }"`,
        ""
    )}
    `;

    return (
        <Flex flexDirection="column" h="100%" pos="relative">
            <Box display="flex" boxSize="100%">
                <SplitPane
                    defaultSize="50%"
                    onResize={(ctx) => {
                        monacoRef.current?.layout({
                            width: ctx.containerSize - ctx.draggedSize,
                            height: monacoRef.current.getLayoutInfo().height,
                        });
                    }}
                >
                    <Box h="100%" flexGrow={1}>
                        <Box mb="4" fontWeight="bold">
                            OpenAPI document - Input
                        </Box>
                        <Editor path="api.ts" defaultLanguage="yaml" defaultValue={input} onChange={setInput} />
                    </Box>
                    <Box h="100%" flexGrow={1}>
                        <Tabs variant="line" size="sm">
                            <TabList>
                                {files.map((file) => (
                                    <Tab key={file.name}>{file.name}</Tab>
                                ))}
                                <Button ml="auto" mr="4" mb="2" size="sm" onClick={onOpen}>
                                    Edit options
                                </Button>
                            </TabList>
                        </Tabs>
                        <Editor
                            path={activeFile.name}
                            defaultLanguage="typescript"
                            value={output}
                            options={{ readOnly: false }}
                            beforeMount={(monaco) => {
                                const declarations: Array<{ name: string; code: string }> = import.meta.compileTime(
                                    "../../get-ts-declarations.ts"
                                );

                                declarations.forEach(({ name, code }) => {
                                    monaco.languages.typescript.typescriptDefaults.addExtraLib(code, name);
                                });
                            }}
                            onMount={(editor) => {
                                monacoRef.current = editor;
                            }}
                        />
                    </Box>
                </SplitPane>
            </Box>
            <Drawer isOpen={isOpen} onClose={onClose} size="lg">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>
                        <Flex justifyContent="space-between" alignItems="center" mr="8">
                            <Code>TemplateContext["options"]</Code>
                            <Button type="submit" form="options-form">
                                Save options
                            </Button>
                        </Flex>
                    </DrawerHeader>

                    <DrawerBody>
                        <SplitPane direction="column" defaultSize="50%">
                            <Box height="100%" overflow="auto">
                                <OptionsForm
                                    id="options-form"
                                    mb="4"
                                    onChange={setPreviewOptions}
                                    onSubmit={setOptions}
                                />
                            </Box>
                            <Box maxHeight="100%" overflow="auto" py="4" fontSize="small">
                                <Box display="flex" alignItems="center">
                                    <Code lang="sh" rounded="md" px="2" py="1" mr="4" fontSize="xs">
                                        {cliCode}
                                    </Code>
                                    <CopyButton width="80px" ml="auto" code={cliCode} />
                                </Box>
                                <Box as="pre" padding="5" rounded="8px" my="4" bg="gray.100" color="gray.800">
                                    {JSON.stringify(relevantOptions, null, 2)}
                                </Box>
                            </Box>
                        </SplitPane>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Flex>
    );
};

const CopyButton = ({ code, ...props }: ButtonProps & { code: string }) => {
    const { hasCopied, onCopy } = useClipboard(code);

    return (
        <Button
            size="sm"
            textTransform="uppercase"
            colorScheme="teal"
            fontSize="xs"
            height="24px"
            {...props}
            onClick={onCopy}
        >
            {hasCopied ? "Copied!" : "Copy"}
        </Button>
    );
};

const optionNameToCliOptionName = {
    withAlias: "--with-alias",
    baseUrl: "--base-url",
    apiClientName: "--api-client-name",
    isErrorStatus: "--error-expr",
    isMainResponseStatus: "--success-expr",
    shouldExportAllSchemas: "--export-schemas",
    isMediaTypeAllowed: "--media-type-expr",
    withImplicitRequiredProps: "--implicit-required",
    withDeprecatedEndpoints: "--with-deprecated",
    groupStrategy: "--group-strategy",
    complexityThreshold: "--complexity-threshold",
    defaultStatusBehavior: "--default-status",
} as const;
