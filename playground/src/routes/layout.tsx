import { Box, Stack } from "@chakra-ui/react";
import { Head, Layout, Link, StyledLink } from "rakkasjs";

import "./layout.css";

const MainLayout: Layout = ({ children }) => {
    return (
        <>
            <Head title="Rakkas" />

            <Box
                as="header"
                display="flex"
                alignItems="flex-end"
                justifyContent="space-between"
                borderBottom="1px"
                borderBottomColor="gray.100"
                py="5"
                px="4"
            >
                <Box as={Link} href="/" fontWeight="bold" fontSize={"2xl"}>
                    openapi-zod-client playground
                </Box>
                <Stack direction="row">
                    <Box
                        as={StyledLink}
                        href="/"
                        px="2"
                        borderRadius="md"
                        _hover={{ backgroundColor: "pink.100" }}
                        activeClass="activeLink"
                    >
                        Home
                    </Box>
                    <Box
                        as={StyledLink}
                        href="/docs"
                        px="2"
                        borderRadius="md"
                        _hover={{ backgroundColor: "pink.100" }}
                        activeClass="activeLink"
                    >
                        Documentation
                    </Box>
                    <Box
                        as={StyledLink}
                        href="https://github.com/astahmer/openapi-zod-client/"
                        px="2"
                        borderRadius="md"
                        _hover={{ backgroundColor: "pink.100" }}
                    >
                        Github
                    </Box>
                    <Box
                        as={StyledLink}
                        href="https://www.zodios.org/"
                        px="2"
                        borderRadius="md"
                        _hover={{ backgroundColor: "pink.100" }}
                    >
                        Zodios
                    </Box>
                </Stack>
            </Box>

            <Box as="section" pt="4" pl="4" h="100%" maxHeight="100%" overflow="auto">
                {children}
            </Box>
        </>
    );
};

export default MainLayout;
