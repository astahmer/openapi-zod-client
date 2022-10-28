// This is the main layout of our app. It renders the header and the footer.

import { Head, Link, StyledLink, Layout } from "rakkasjs";
import { Box } from "../theme/Box";
import { HStack } from "../theme/components";

import { sprinkles } from "../theme/sprinkles.css";
import { headerClass } from "./layout.css";

const activeClass = sprinkles({ backgroundColor: "pink.200" });
const navLinkClass = sprinkles({ p: 2, borderRadius: "md", backgroundColor: { hover: "pink.100" } });

const MainLayout: Layout = ({ children }) => (
    <>
        <Head title="Rakkas" />

        <Box
            className={headerClass}
            as="header"
            display="flex"
            alignItems="flex-end"
            justifyContent="space-between"
            borderBottomColor="gray.100"
            borderBottom="1px"
            py="5"
            px="4"
        >
            <Box as={Link} href="/" fw="bold" fontSize={"2xl"}>
                Rakkas Demo App
            </Box>
            <HStack>
                <StyledLink href="/" className={navLinkClass} activeClass={activeClass}>
                    Home
                </StyledLink>
                <StyledLink href="/about" className={navLinkClass} activeClass={activeClass}>
                    About
                </StyledLink>
                <StyledLink href="/todo" className={navLinkClass} activeClass={activeClass}>
                    Todo
                </StyledLink>
                <StyledLink href="/editor" className={navLinkClass} activeClass={activeClass}>
                    Editor
                </StyledLink>
                <StyledLink href="/play" className={navLinkClass} activeClass={activeClass}>
                    Play
                </StyledLink>
            </HStack>
        </Box>

        <Box as="section" pt="4" pl="4" flexGrow={1}>
            {children}
        </Box>
    </>
);

export default MainLayout;
