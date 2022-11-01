import { Box, Checkbox, Flex } from "@chakra-ui/react";
import { getZodSchema } from "openapi-zod-client";
import { FC } from "react";
import { SplitPane } from "../components/SplitPane/SplitPane";

const EditorPage: FC = () => {
    const code = getZodSchema({ schema: { type: "string" } });

    return (
        <Flex flexDirection="column" h="100%">
            <Box fontWeight="bold" color="teal.200">
                Input
            </Box>
            <Box display="flex" boxSize="100%">
                <SplitPane>
                    <Box h="100%" flexGrow={1}>
                        {/* <PlaygroundEditor /> */}
                        PlaygroundEditor
                        <button onClick={() => import("../petstore.yaml")}></button>
                    </Box>

                    <Box fontWeight="bold" color="teal.200">
                        {code.toString()}
                        <Checkbox />
                    </Box>
                </SplitPane>
            </Box>
        </Flex>
    );
};

export default EditorPage;
