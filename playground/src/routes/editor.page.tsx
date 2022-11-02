import {
    Box,
    Button,
    Code,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    useDisclosure,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import type { TemplateContextOptions } from "openapi-zod-client";
import { getHandlebars, getZodClientTemplateContext, maybePretty } from "openapi-zod-client";
import { safeJSONParse } from "pastable";
import { FC, useDeferredValue, useMemo, useState } from "react";
import { parse } from "yaml";
import { default as petstoreYaml } from "../../../examples/petstore.yaml?raw";
import { default as baseOutputTemplate } from "../../../lib/src/template.hbs?raw";
import { OptionsForm } from "../components/OptionsForm";
import { SplitPane } from "../components/SplitPane/SplitPane";

// TODO: Add a way to pass in a custom template.
// template context explorer
// browse examples
// select samples
// input = getZodSchema
// localStorage persistence for input
// reset btn (= localStorage.clear + input=petstore.yaml)

const EditorPage: FC = () => {
    const [options, setOptions] = useState<Partial<TemplateContextOptions>>({});
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

        const output = template({ ...ctx, options });
        return maybePretty(output, {
            printWidth: 120,
            tabWidth: 4,
            arrowParens: "always",
            useTabs: false,
            semi: true,
            singleQuote: false,
            trailingComma: "es5",
        });
    }, [ctx]);

    return (
        <Flex flexDirection="column" h="100%" pos="relative">
            <Box display="flex" boxSize="100%" overflow="hidden">
                <SplitPane defaultSize="50%">
                    <Box h="100%" flexGrow={1}>
                        <Box mb="4" fontWeight="bold">
                            OpenAPI document - Input
                        </Box>
                        <Editor defaultLanguage="yaml" defaultValue={input} onChange={setInput} />
                    </Box>
                    <Box h="100%" flexGrow={1}>
                        <Box mb="4" fontWeight="bold">
                            Zodios client - Output
                        </Box>
                        <Editor
                            defaultLanguage="typescript"
                            defaultValue={output}
                            options={{ readOnly: false }}
                            beforeMount={(monaco) => {
                                const declarations: Array<{ name: string; code: string }> = import.meta.compileTime(
                                    "../../get-ts-declarations.ts"
                                );

                                declarations.forEach(({ name, code }) => {
                                    monaco.languages.typescript.typescriptDefaults.addExtraLib(code, name);
                                });
                            }}
                        />
                    </Box>
                </SplitPane>
            </Box>
            <Button onClick={onOpen}>Edit options</Button>
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
                        <SplitPane direction="column" defaultSize="80%">
                            <Box height="100%" overflow="auto">
                                <OptionsForm
                                    id="options-form"
                                    mb="4"
                                    onChange={setOptions}
                                    onSubmit={(values) => console.log(values)}
                                />
                            </Box>
                            <Box maxHeight="100%" overflow="auto">
                                <span>Options object used</span>
                                <pre>{JSON.stringify(options, null, 2)}</pre>
                            </Box>
                        </SplitPane>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Flex>
    );
};

export default EditorPage;
