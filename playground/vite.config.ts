import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";

// import path from "node:path";

export default defineConfig({
    plugins: [
        rakkas({
            react: {
                jsxImportSource: "/src/emotion",
                babel: {
                    plugins: ["@emotion/babel-plugin"],
                },
            },
        }),
    ],
    define: {
        "process.env.TEST": false,
        global: {}, // for handlebars
    },
    ssr: {
        external: ["handlebars", "tanu", "whence"],
        // This is required to fix ESM/CJS incompatibilities
        noExternal: ["@emotion/styled"],
    },
    resolve: {
        alias: {
            // "openapi-zod-client": path.resolve(__dirname, "../lib"),
        },
    },
});
