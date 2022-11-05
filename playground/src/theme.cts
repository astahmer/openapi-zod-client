import { baseTheme } from "@saas-ui/react";

import { extendTheme } from "@chakra-ui/react";

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
};

export const appTheme = extendTheme(
    {
        colors,
        semanticTokens: {
            colors: {
                text: {
                    default: "gray.800",
                    _dark: "gray.50",
                },
                bg: {
                    default: "gray.50",
                    _dark: "gray.800",
                },
                "bg-darker": {
                    default: "gray.200",
                    _dark: "gray.600",
                },
                bgHover: {
                    default: "gray.100",
                    _dark: "gray.700",
                },
            },
        },
    },
    baseTheme
);

// for the CLI https://chakra-ui.com/docs/styled-system/cli
export default appTheme;
