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
    Kbd,
    Menu,
    MenuButton,
    MenuItem,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
    ModalFooter,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Tab,
    TabList,
    Tabs,
    useClipboard,
    useColorMode,
    useModalContext,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { Field, FormDialog, FormLayout, useFormContext } from "@saas-ui/react";
import { useActor, useSelector } from "@xstate/react";
import type { TemplateContextOptions } from "openapi-zod-client";
import { PropsWithChildren } from "react";
import { match } from "ts-pattern";
import { defaultOptionValues, OptionsForm, OptionsFormValues } from "../components/OptionsForm";
import { SplitPane } from "../components/SplitPane/SplitPane";
import { presetTemplateList } from "./Playground.consts";
import { FileTabData, usePlaygroundContext } from "./Playground.machine";
import { presets } from "./presets";

// TODO
// template context explorer -> copy ctx as JSON to clipboard + open https://jsoncrack.com/editor
// input = getZodSchema
// TODO diff editor + collect warnings
// display openapi-zod-client version
// customizable prettier config + add prettierc.json in inputList ?
// https://reactflow.dev/ + dependency graph
// monaco settings (theme + inline diff or not / minimap / etc)

// FileTabForm also using monaco
// -> prettier schema for autocomplete on options
//  https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-configure-json-defaults
// -> openapi schema for yaml/json ?

// when hovering on output, show source schema in input ?
// https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-hover-provider-example
// https://github.com/OAI/OpenAPI-Specification/blob/main/schemas/v3.0/schema.json
// https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/prettierrc.json

// TODO display input errors (yaml/json parsing)

export const Playground = () => {
    const service = usePlaygroundContext();
    const [state, send] = useActor(service);

    const activeInputTab = state.context.activeInputTab;
    const activeInputIndex = state.context.activeInputIndex;

    const inputList = state.context.inputList;

    const activeOutputTab = state.context.activeOutputTab;
    const outputList = state.context.outputList;

    const { colorMode } = useColorMode();

    return (
        <Flex h="100%" pos="relative">
            <Box display="flex" boxSize="100%">
                <SplitPane defaultSize="50%" onResize={(ctx) => send({ type: "Resize", context: ctx })}>
                    <Box h="100%" flexGrow={1}>
                        <Tabs variant="line" size="sm" index={activeInputIndex}>
                            <TabList
                                minH="42px"
                                className="scrollbar"
                                overflowX="scroll"
                                overflowY="hidden"
                                scrollSnapType="x"
                                scrollSnapAlign="start"
                                cursor="pointer"
                                onDoubleClick={(e) => {
                                    if (e.target === e.currentTarget) {
                                        send({ type: "Add file" });
                                    }
                                }}
                            >
                                {inputList.map((fileTab) => {
                                    const indicator = match(fileTab.name)
                                        .with(state.context.selectedOpenApiFileName, () => "[o]")
                                        .with(state.context.selectedTemplateName, () => "[t]")
                                        .with(state.context.selectedPrettierConfig, () => "[p]")
                                        .otherwise(() => "");

                                    return (
                                        <FileTab
                                            key={fileTab.name}
                                            onClick={() => send({ type: "Select input tab", tab: fileTab })}
                                        >
                                            {indicator ? <Box mr="1">{indicator}</Box> : null}
                                            <Box>{fileTab.name}</Box>
                                            <FileTabActions fileTab={fileTab} />
                                        </FileTab>
                                    );
                                })}
                                <FileTab onClick={() => send({ type: "Add file" })}>
                                    <Box display="flex" alignItems="center">
                                        <Box className="i-material-symbols-add" boxSize="1.25em" mt="1" />
                                        Add
                                    </Box>
                                </FileTab>
                            </TabList>
                        </Tabs>
                        <Editor
                            path={activeInputTab}
                            value={inputList.at(activeInputIndex)?.content}
                            onChange={(content) => send({ type: "Update input", value: content ?? "" })}
                            onMount={(editor, monaco) => {
                                send({ type: "Editor Loaded", editor, name: "input" });
                                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                                    send({ type: "Save" });
                                });
                            }}
                            theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
                        />
                    </Box>
                    <Box h="100%" flexGrow={1}>
                        <Tabs variant="line" size="sm" index={state.context.activeOutputIndex}>
                            <TabList pb="2" h="42px">
                                {outputList.map((file) => (
                                    <FileTab
                                        key={file.name}
                                        onClick={() => send({ type: "Select output tab", tab: file })}
                                    >
                                        {file.name}
                                    </FileTab>
                                ))}
                                <PlaygroundActions />
                            </TabList>
                        </Tabs>
                        <Editor
                            path={activeOutputTab}
                            value={outputList.at(state.context.activeOutputIndex)?.content}
                            theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
                            beforeMount={(monaco) => {
                                const declarations: Array<{ name: string; code: string }> = import.meta.compileTime(
                                    "../../get-ts-declarations.ts"
                                );

                                declarations.forEach(({ name, code }) => {
                                    monaco.languages.typescript.typescriptDefaults.addExtraLib(code, name);
                                });
                            }}
                            onMount={(editor, monaco) =>
                                send({ type: "Editor Loaded", editor, name: "output", monaco })
                            }
                        />
                    </Box>
                </SplitPane>
            </Box>
            <FileTabForm />
            <OptionsDrawer />
        </Flex>
    );
};

const FileTab = ({ children, onClick }: PropsWithChildren<{ onClick: () => void }>) => {
    return (
        <Tab
            display="flex"
            alignItems="center"
            onClick={onClick}
            borderWidth="1px"
            borderColor="bgHover"
            backgroundColor="bg"
            _selected={{ bg: "bgHover", fontWeight: "bold" }}
            data-group
        >
            {children}
        </Tab>
    );
};

const FileTabActions = ({ fileTab }: { fileTab: FileTabData }) => {
    const file = fileTab;
    const service = usePlaygroundContext();
    const send = service.send;

    return (
        <ButtonGroup alignItems="center" ml="2" hidden={Boolean(file.preset)}>
            <Button
                as="div"
                colorScheme="blue"
                aria-label="Edit"
                className="i-material-symbols-edit-square-outline"
                boxSize="1.25em"
                padding="0"
                borderRadius="0"
                minWidth="0"
                onClick={(e) => {
                    e.stopPropagation();
                    if (file.preset) return;
                    send({ type: "Edit file", tab: file });
                }}
                visibility="hidden"
                _groupHover={{ visibility: "visible" }}
                isDisabled={Boolean(file.preset)}
            />
            <Button
                as="div"
                colorScheme="red"
                aria-label="Close"
                className="i-material-symbols-close"
                boxSize="1.25em"
                padding="0"
                borderRadius="0"
                minWidth="0"
                mt="1"
                onClick={(e) => {
                    e.stopPropagation();
                    send({ type: "Remove file", tab: file });
                }}
                visibility="hidden"
                _groupHover={{ visibility: "visible" }}
            />
        </ButtonGroup>
    );
};

const PlaygroundActions = () => {
    const service = usePlaygroundContext();
    const send = service.send;

    const selectedPresetTemplate = useSelector(service, (state) => state.context.selectedPresetTemplate);
    const selectedTemplateName = useSelector(service, (state) => state.context.selectedTemplateName);
    const selectedPreset = presetTemplateList.find((t) => t.preset === selectedPresetTemplate)!;
    const defaultValue = selectedPreset?.preset ?? "";

    return (
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
                <MenuItem onClick={() => send({ type: "Save" })}>
                    <span>Save</span>
                    <Box ml="auto">
                        <Kbd fontSize="xs">cmd</Kbd> + <Kbd fontSize="xs">s</Kbd>
                    </Box>
                </MenuItem>
                <MenuItem onClick={() => send({ type: "Reset" })}>Reset</MenuItem>
                <MenuItem onClick={() => send({ type: "Add file" })}>Add input file</MenuItem>
                <Popover trigger="hover" placement="left" closeOnBlur={false}>
                    <PopoverTrigger>
                        <MenuItem>Select handlebars template</MenuItem>
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverBody>
                            <MenuOptionGroup
                                defaultValue={defaultValue}
                                title="Template presets"
                                type="radio"
                                onChange={(value) =>
                                    send({
                                        type: "Select preset template",
                                        presetTemplate: presetTemplateList.find(
                                            (preset) => preset.preset === (value as string)
                                        )!,
                                    })
                                }
                            >
                                {presetTemplateList.map((preset) => (
                                    <MenuItemOption
                                        key={preset.preset}
                                        value={preset.preset}
                                        isDisabled={preset.preset === defaultValue}
                                    >
                                        {preset.name}
                                    </MenuItemOption>
                                ))}
                            </MenuOptionGroup>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
                <MenuItem>Use OpenAPI samples</MenuItem>
                <MenuItem onClick={() => send({ type: "Open options" })}>Edit lib options</MenuItem>
                <MenuItem onClick={() => send({ type: "Open monaco settings" })}>Edit monaco settings</MenuItem>
                <MenuItem as="a" href="https://apis.guru/" target="_blank" rel="external">
                    Browse APIs.guru
                </MenuItem>
            </MenuList>
        </Menu>
    );
};

const FileTabForm = () => {
    const service = usePlaygroundContext();
    const [state, send] = useActor(service);

    const formModalDefaultValues = state.context.fileForm;
    const inputList = state.context.inputList;

    return (
        <FormDialog
            size="2xl"
            title={state.matches("ready.Creating file tab") ? "Add input file" : "Edit input file"}
            defaultValues={formModalDefaultValues}
            mode="onSubmit"
            isOpen={state.hasTag("file")}
            onClose={() => send({ type: "Close modal" })}
            onSubmit={(fileTab) => send({ type: "Submit file modal", tab: fileTab })}
            footer={<CreateFileFormFooter />}
        >
            <FormLayout>
                <Field
                    name="name"
                    label="File name*"
                    type="text"
                    help="The extension will be used to determine if it's an OpenAPI document `{.yaml,.yml,.json}`, an handlebars template `.hbs` or a prettier config `.prettierrc.json`"
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
    );
};

const OptionsDrawer = () => {
    const service = usePlaygroundContext();
    const [state, send] = useActor(service);

    const activeOutputTab = state.context.activeOutputTab;

    const relevantOptions = getRelevantOptions(state.context.previewOptions);
    const cliCode = createPnpmCommand(activeOutputTab, relevantOptions);

    return (
        <Drawer
            isOpen={state.matches("ready.Editing options")}
            onClose={() => send({ type: "Close options" })}
            size="lg"
            placement="left"
        >
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>
                    <Flex justifyContent="space-between" alignItems="center" mr="8">
                        <Code>TemplateContext["options"]</Code>
                        <ButtonGroup>
                            <Button variant="outline" onClick={() => send({ type: "Reset preview options" })}>
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
                                key={state.context.optionsFormKey}
                                id="options-form"
                                mb="4"
                                onChange={(update) =>
                                    send({ type: "Update preview options", options: update as OptionsFormValues })
                                }
                                onSubmit={(values) => send({ type: "Save options", options: values })}
                                defaultValues={state.context.previewOptions}
                            />
                        </Box>
                        <Box maxHeight="100%" overflow="auto" py="4" fontSize="small">
                            <Box display="flex" alignItems="center">
                                <Code lang="sh" rounded="md" px="2" py="1" mr="4" fontSize="xs">
                                    {cliCode}
                                </Code>
                                <CopyButton width="80px" ml="auto" code={cliCode} />
                            </Box>
                            <Box as="pre" padding="5" rounded="8px" my="4" bg="bgHover" color="text">
                                {JSON.stringify(relevantOptions, null, 2)}
                            </Box>
                        </Box>
                    </SplitPane>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
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
                <Button variant="outline" onClick={() => form.setValue("content", presets.defaultInput)}>
                    Use petstore
                </Button>
                <Button type="submit">Save file</Button>
            </ButtonGroup>
        </ModalFooter>
    );
};
