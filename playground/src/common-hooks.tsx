import { SaasProvider, baseTheme, ModalsProvider } from "@saas-ui/react";
import type { CommonHooks } from "rakkasjs";

import { extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const colors = {
    gray: {
        "50": "#EEF7F7",
        "100": "#CEE8E8",
        "200": "#AFDADA",
        "300": "#90CBCB",
        "400": "#70BCBC",
        "500": "#51AEAE",
        "600": "#418B8B",
        "700": "#316868",
        "800": "#204646",
        "900": "#102323",
    },
    primary: {
        "50": "#FAEAEF",
        "100": "#F2C5D2",
        "200": "#EA9FB4",
        "300": "#E17997",
        "400": "#D9547A",
        "500": "#D12E5D",
        "600": "#A7254A",
        "700": "#7D1C38",
        "800": "#531325",
        "900": "#2A0913",
    },
};

const theme = extendTheme({ colors }, baseTheme);
const queryClient = new QueryClient();

const hooks: CommonHooks = {
    wrapApp: (app) => (
        <QueryClientProvider client={queryClient}>
            <SaasProvider theme={theme}>
                <ModalsProvider>{app}</ModalsProvider>
            </SaasProvider>
        </QueryClientProvider>
    ),
};

export default hooks;
