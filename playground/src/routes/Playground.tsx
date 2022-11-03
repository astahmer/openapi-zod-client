import {
    Box,
    Button,
    ButtonGroup,
    ButtonProps,
    Code,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    ModalFooter,
    Tab,
    TabList,
    Tabs,
    useClipboard,
    useDisclosure,
    useModalContext,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { Field, FormDialog, FormLayout, useFormContext } from "@saas-ui/react";
import { editor } from "monaco-editor";
import type { TemplateContextOptions } from "openapi-zod-client";
import { getHandlebars, getZodClientTemplateContext, maybePretty } from "openapi-zod-client";
import { removeAtIndex, safeJSONParse, updateAtIndex } from "pastable";
import { MouseEventHandler, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { parse } from "yaml";
import { default as petstoreYaml } from "../../../examples/petstore.yaml?raw";
import { default as baseOutputTemplate } from "../../../lib/src/template.hbs?raw";
import { defaultOptionValues, OptionsForm } from "../components/OptionsForm";
import { SplitPane } from "../components/SplitPane/SplitPane";

// TODO: Add a way to pass in a custom template.
// template context explorer
// browse examples from https://apis.guru/
// input = getZodSchema
// localStorage persistence for input
// TODO diff editor + collect warnings
// test with json input

const useOpenApiZodClient = (input: string, options: TemplateContextOptions) => {
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

    return useMemo(() => {
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
};

export const Playground = () => {
    const [options, setOptions] = useState<Partial<TemplateContextOptions>>({});
    const [previewOptions, setPreviewOptions] = useState<Partial<TemplateContextOptions & { booleans: string[] }>>({});

    const [activeInputTab, setActiveInputTab] = useState("openapi.doc.yaml");
    const [inputList, setInputList] = useState<FileTab[]>([{ name: activeInputTab, content: petstoreYaml, index: 0 }]);

    const inputIndex = inputList.findIndex((tab) => tab.name === activeInputTab);
    const input = inputList[inputIndex]?.content ?? "";
    const output = useOpenApiZodClient(input, options);

    useEffect(() => {
        outputEditorRef.current?.setValue(output);
    }, [output]);
    // console.log({ input, output });

    const [activeOutputTab, setActiveOutputTab] = useState("api.client.ts");
    const [outputList, setOutputList] = useState<FileTab[]>([{ name: activeOutputTab, content: output, index: 0 }]);

    const relevantOptions = getRelevantOptions(previewOptions);
    const cliCode = createPnpmCommand(activeOutputTab, relevantOptions);

    const formModal = useDisclosure();
    const [formModalDefaultValues, setFormModalDefaultValues] = useState<FileTab>({ name: "", content: "", index: -1 });

    const optionsDrawer = useDisclosure();
    const outputEditorRef = useRef<editor.IStandaloneCodeEditor>();

    return (
        <Flex flexDirection="column" h="100%" pos="relative">
            <Box display="flex" boxSize="100%">
                <SplitPane
                    defaultSize="50%"
                    onResize={(ctx) => {
                        outputEditorRef.current?.layout({
                            width: ctx.containerSize - ctx.draggedSize,
                            height: outputEditorRef.current.getLayoutInfo().height,
                        });
                    }}
                >
                    <Box h="100%" flexGrow={1}>
                        <Tabs variant="line" size="sm" h="42px" index={inputIndex}>
                            <TabList
                                pb="2"
                                className="scrollbar"
                                overflowX="auto"
                                overflowY="hidden"
                                scrollSnapType="x"
                                scrollSnapAlign="start"
                            >
                                {inputList.map((file, index) => {
                                    const openEditForm: MouseEventHandler = (e) => {
                                        e.stopPropagation();
                                        setFormModalDefaultValues(file);
                                        formModal.onOpen();
                                    };

                                    return (
                                        <Tab
                                            key={file.name}
                                            display="flex"
                                            alignItems="center"
                                            onClick={(e) => {
                                                setActiveInputTab(file.name);
                                                // if (file.name === activeInputTab) {
                                                //     openEditForm(e);
                                                // }
                                            }}
                                            border="none"
                                            _selected={{ bg: "gray.100", fontWeight: "bold" }}
                                            borderRadius="md"
                                            data-group
                                        >
                                            <Box>{file.name}</Box>
                                            <ButtonGroup alignItems="center" ml="2">
                                                <Button
                                                    as="div"
                                                    aria-label="Edit"
                                                    className="i-material-symbols-edit-square-outline"
                                                    boxSize="1.25em"
                                                    padding="0"
                                                    borderRadius="0"
                                                    minWidth="0"
                                                    onClick={openEditForm}
                                                    backgroundColor="gray.400"
                                                    visibility="hidden"
                                                    _groupHover={{ visibility: "visible" }}
                                                />
                                                <Button
                                                    as="div"
                                                    aria-label="Close"
                                                    className="i-material-symbols-close"
                                                    boxSize="1.25em"
                                                    padding="0"
                                                    borderRadius="0"
                                                    minWidth="0"
                                                    mt="1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const next = removeAtIndex(inputList, index);
                                                        console.log(next);
                                                        setActiveInputTab(next[index === 0 ? 0 : index - 1]!.name);
                                                        setInputList(next);
                                                    }}
                                                    backgroundColor="red.300"
                                                    isDisabled={inputList.length < 2}
                                                    visibility="hidden"
                                                    _groupHover={{ visibility: "visible" }}
                                                />
                                            </ButtonGroup>
                                        </Tab>
                                    );
                                })}
                                <Menu>
                                    <MenuButton
                                        as={Button}
                                        flexShrink={0}
                                        ml="auto"
                                        mr="4"
                                        size="sm"
                                        variant="outline"
                                        rightIcon={<Box className="i-mdi-chevron-down" boxSize="1.25em" />}
                                    >
                                        Actions
                                    </MenuButton>
                                    <MenuList>
                                        <MenuItem
                                            onClick={() => {
                                                setFormModalDefaultValues({
                                                    name: "",
                                                    content: "",
                                                    index: inputList.length,
                                                });
                                                formModal.onOpen();
                                            }}
                                        >
                                            Create input file
                                        </MenuItem>
                                        <MenuItem>Select handlebars template</MenuItem>
                                        <MenuItem>Use OpenAPI samples</MenuItem>
                                    </MenuList>
                                </Menu>
                            </TabList>
                        </Tabs>
                        <Editor
                            path={activeInputTab}
                            defaultLanguage="yaml"
                            defaultValue={inputList.find((file) => file.name === activeInputTab)?.content}
                            onChange={(content) =>
                                setInputList((current) => {
                                    const index = current.findIndex((file) => file.name === activeInputTab);
                                    return updateAtIndex(current, index, { ...current[index], content } as FileTab);
                                })
                            }
                        />
                    </Box>
                    <Box h="100%" flexGrow={1}>
                        <Tabs variant="line" size="sm">
                            <TabList pb="2" h="42px">
                                {outputList.map((file) => (
                                    <Tab
                                        key={file.name}
                                        onClick={() => setActiveOutputTab(file.name)}
                                        border="none"
                                        _selected={{ bg: "gray.100", fontWeight: "bold" }}
                                        borderRadius="md"
                                    >
                                        {file.name}
                                    </Tab>
                                ))}
                                <Button
                                    variant="outline"
                                    ml="auto"
                                    mr="4"
                                    mb="2"
                                    size="sm"
                                    onClick={optionsDrawer.onOpen}
                                >
                                    Edit options
                                </Button>
                            </TabList>
                        </Tabs>
                        <Editor
                            path={activeOutputTab}
                            defaultLanguage="typescript"
                            defaultValue={outputList.find((file) => file.name === activeOutputTab)?.content}
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
                                outputEditorRef.current = editor;
                            }}
                        />
                    </Box>
                </SplitPane>
            </Box>
            <FormDialog
                size="2xl"
                title={!formModalDefaultValues.name ? "Create input file" : "Edit input file"}
                defaultValues={formModalDefaultValues}
                mode="onSubmit"
                {...formModal}
                onSubmit={(fileTab) => {
                    setInputList((current) => [...current, fileTab]);
                    setActiveInputTab(fileTab.name);
                    formModal.onClose();
                    console.log(fileTab);
                }}
                footer={<CreateFileFormFooter />}
            >
                <FormLayout>
                    <Field
                        name="name"
                        label="File name*"
                        type="text"
                        rules={{
                            required: "File name is required",
                            validate: {
                                unique: (value: string) =>
                                    inputList.some(
                                        (file) => file.name === value && formModalDefaultValues.index !== file.index
                                    )
                                        ? "File name should be unique"
                                        : true,
                            },
                        }}
                        autoFocus
                    />
                    <Field name="content" type="textarea" label="Content" rows={14} />
                </FormLayout>
            </FormDialog>
            <Drawer isOpen={optionsDrawer.isOpen} onClose={optionsDrawer.onClose} size="lg">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>
                        <Flex justifyContent="space-between" alignItems="center" mr="8">
                            <Code>TemplateContext["options"]</Code>
                            <ButtonGroup>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setPreviewOptions(defaultOptionValues);
                                        setOptions(defaultOptionValues);
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button type="submit" form="options-form">
                                    Save options
                                </Button>
                            </ButtonGroup>
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

type FileTab = { name: string; content: string; index: number };

const createPnpmCommand = (outputPath: string, relevantOptions: TemplateContextOptions) => {
    return `pnpx openapi-zod-client ./petstore.yaml -o ./${outputPath}
    ${Object.entries(relevantOptions).reduce(
        (acc, [optionName, value]) =>
            `${acc} ${optionNameToCliOptionName[optionName as keyof typeof optionNameToCliOptionName]}="${
                value as string
            }"`,
        ""
    )}
    `;
};

function getRelevantOptions(options: Partial<TemplateContextOptions> & { booleans?: string[] }) {
    return Object.fromEntries(
        Object.entries({
            ...options,
            ...Object.fromEntries((options.booleans ?? []).map((boolOption) => [boolOption, true])),
        }).filter(
            ([name, value]) =>
                Boolean(value) &&
                name !== "booleans" &&
                value !== defaultOptionValues[name as keyof typeof defaultOptionValues]
        )
    );
}

const CreateFileFormFooter = () => {
    const form = useFormContext();
    const modal = useModalContext();
    return (
        <ModalFooter>
            <ButtonGroup>
                <Button variant="ghost" mr={3} onClick={modal.onClose}>
                    Cancel
                </Button>
                <Button variant="outline" onClick={() => form.setValue("content", petstoreYaml)}>
                    Use petstore
                </Button>
                <Button type="submit">Save file</Button>
            </ButtonGroup>
        </ModalFooter>
    );
};
