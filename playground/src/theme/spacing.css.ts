import { defineProperties } from "@vanilla-extract/sprinkles";
import { theme } from "./vars.css";

const space = theme.space as Record<keyof typeof theme.space | `${keyof typeof theme.space}`, string>;

export type Space = keyof typeof space;

export const spacingStyles = defineProperties({
    properties: {
        gap: space,
        padding: space,
        paddingTop: space,
        paddingBottom: space,
        paddingLeft: space,
        paddingRight: space,
        margin: space,
        marginTop: space,
        marginBottom: space,
        marginLeft: space,
        marginRight: space,
        borderWidth: theme.borders,
        borderTop: theme.borders,
        borderBottom: theme.borders,
        borderLeft: theme.borders,
        borderRight: theme.borders,
        borderRadius: theme.radii,
    },
    shorthands: {
        mt: ["marginTop"],
        mr: ["marginRight"],
        mb: ["marginBottom"],
        ml: ["marginLeft"],
        mx: ["marginLeft", "marginRight"],
        my: ["marginTop", "marginBottom"],
        m: ["marginLeft", "marginRight", "marginTop", "marginBottom"],
        marginX: ["marginLeft", "marginRight"],
        marginY: ["marginTop", "marginBottom"],
        pt: ["paddingTop"],
        pr: ["paddingRight"],
        pb: ["paddingBottom"],
        pl: ["paddingLeft"],
        px: ["paddingLeft", "paddingRight"],
        p: ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"],
        paddingX: ["paddingLeft", "paddingRight"],
        paddingY: ["paddingTop", "paddingBottom"],
        py: ["paddingTop", "paddingBottom"],
        bw: ["borderWidth"],
        bx: ["borderLeft", "borderRight"],
        by: ["borderTop", "borderBottom"],
    },
});
