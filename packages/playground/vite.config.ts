import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
    plugins: [vanillaExtractPlugin(), rakkas()],
    define: {
        "process.env.TEST": false,
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
    optimizeDeps: {
        exclude: [
            "fs-extra",
            "openapi3-ts",
            // "handlebars",
            "pastable/server",
            // "tanu",
            // "whence",
            // "prettier",
            "yaml",
            "yaml*",
            "yaml@2.1.3",
            "ts-toolbelt",
        ],
    },
});
