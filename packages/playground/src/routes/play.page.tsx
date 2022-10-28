import { FC } from "react";
import { Box } from "../theme/Box";
import { VFlex } from "../theme/components";
import { getZodSchema } from "openapi-zod-client";

const PlayPage: FC = () => {
    try {
        const code = getZodSchema({ schema: { type: "string" } });
        console.log({ code });
    } catch (error) {
        console.log(error);
    }
    // console.log(code.toString());

    return (
        <VFlex d="flex" h="100%" style={{ minHeight: "500px" }}>
            <Box fontWeight="bold" color="teal.200">
                aaa
            </Box>
            <Box fontWeight="bold" color="teal.200">
                After
            </Box>
        </VFlex>
    );
};

export default PlayPage;
