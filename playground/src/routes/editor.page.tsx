import { FC } from "react";
import { PlaygroundEditor } from "../PlaygroundEditor";
import { Box } from "../theme/Box";
import { VFlex } from "../theme/components";

const EditorPage: FC = () => (
    <VFlex d="flex" h="100%" style={{ minHeight: "500px" }}>
        <Box fontWeight="bold" color="teal.200">
            Editor
        </Box>
        <Box h="100%" flexGrow={1}>
            <PlaygroundEditor />
        </Box>
        <Box fontWeight="bold" color="teal.200">
            After
        </Box>
    </VFlex>
);

export default EditorPage;
