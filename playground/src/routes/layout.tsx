import { Box, Code, IconButton, Stack, useColorMode } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

import "./layout.css";
import { TwitterIcon } from "../components/twitter-icon";

const version: string = import.meta.compileTime("../macros/get-package-version.ts");

export const MainLayout = ({ children }: PropsWithChildren) => {
    return (
        <>
            <Box
                as="header"
                display="flex"
                alignItems="flex-end"
                justifyContent="space-between"
                borderBottom="1px"
                borderBottomColor="bgHover"
                py="5"
                px="4"
            >
                <Box fontWeight="bold" fontSize={"2xl"}>
                    <Code
                        variant="solid"
                        fontSize="2xl"
                        // as={Link}
                        as="a"
                        href="https://github.com/astahmer/openapi-zod-client/"
                        rel="external"
                        target="_blank"
                    >
                        openapi-zod-client v{version}
                    </Code>
                </Box>
                <Stack direction="row" alignItems="center">
                    <Box
                        // as={StyledLink}
                        as="a"
                        href="https://github.com/astahmer/openapi-zod-client/"
                        rel="external"
                        target="_blank"
                        px="2"
                        py="1"
                        borderRadius="md"
                        _hover={{ backgroundColor: "bg-darker" }}
                    >
                        <Box className="i-mdi-github" boxSize="1.5em" />
                    </Box>
                    <Box as="a" target="blank" href="https://twitter.com/astahmer_dev">
                        <IconButton aria-label="Twitter">
                            <TwitterIcon />
                        </IconButton>
                    </Box>
                    <Box
                        // as={StyledLink}
                        as="a"
                        href="https://www.zodios.org/"
                        rel="external"
                        target="_blank"
                        px="2"
                        py="1"
                        borderRadius="md"
                        _hover={{ backgroundColor: "bg-darker" }}
                        display="flex"
                        alignItems="center"
                    >
                        <Box className="i-ic-outline-diamond" boxSize="1.5em" color="purple" mr="1" />
                        Zodios
                    </Box>
                    <ColorModeSwitchIconButton />
                </Stack>
            </Box>

            <Box as="section" pt="4" pl="4" h="100%" maxHeight="100%" overflow="auto">
                {children}
            </Box>
        </>
    );
};

const ColorModeSwitchIconButton = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
        <IconButton
            aria-label="Color mode switch"
            onClick={toggleColorMode}
            size="sm"
            icon={
                colorMode === "light" ? (
                    <Box className="i-material-symbols-sunny" boxSize="1em" />
                ) : (
                    <Box className="i-ri-moon-clear-fill" boxSize="1em" />
                )
            }
        />
    );
};
