import { defineConfig, PluginOption } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import compileTime from "vite-plugin-compile-time";

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
        compileTime(),
    ],
    define: {
        "process.env.TEST": true,
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
