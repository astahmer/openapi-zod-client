import { ChakraProvider } from "@chakra-ui/react";
import type { CommonHooks } from "rakkasjs";

const hooks: CommonHooks = {
    wrapApp: (app) => <ChakraProvider>{app}</ChakraProvider>,
};

export default hooks;
