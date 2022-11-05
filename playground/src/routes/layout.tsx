import { Box, Button, Code, IconButton, Stack, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { Head, Layout, Link, StyledLink } from "rakkasjs";

import "./layout.css";

const MainLayout: Layout = ({ children }) => {
    return (
        <>
            <Head title="playground - openapi-zod-client" />

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
                        as={Link}
                        href="https://github.com/astahmer/openapi-zod-client/"
                        rel="external"
                        target="_blank"
                    >
                        openapi-zod-client
                    </Code>
                </Box>
                <Stack direction="row">
                    <Box
                        as={StyledLink}
                        href="/"
                        px="2"
                        py="1"
                        borderRadius="md"
                        _hover={{ backgroundColor: "bg-darker" }}
                        activeClass="activeLink"
                    >
                        Playground
                    </Box>
                    <Box
                        as={StyledLink}
                        href="/docs"
                        px="2"
                        py="1"
                        borderRadius="md"
                        _hover={{ backgroundColor: "bg-darker" }}
                        activeClass="activeLink"
                    >
                        Documentation
                    </Box>
                    <Box
                        as={StyledLink}
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
                    <Box
                        as={StyledLink}
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

export default MainLayout;

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
