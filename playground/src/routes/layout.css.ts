import { globalStyle, style } from "@vanilla-extract/css";

globalStyle("html, body, #root", {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    margin: 0,
});

globalStyle("*, :after, :before", {
    boxSizing: "border-box",
    border: "0 solid",
});

globalStyle(":root", {
    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
    "Helvetica Neue", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    color: "#333",
    fontSize: "16px",
});

globalStyle("a:hover", {
    color: "#924",
    textDecoration: "none",
});
globalStyle("a:hover", {
    color: "#c06",
    textDecoration: "underline",
});

export const headerClass = style({});
globalStyle(`${headerClass} a`, {
    textDecoration: "none",
});

globalStyle("main", {
    maxWidth: "40rem",
    margin: "auto",
    lineHeight: 1.6,
});
