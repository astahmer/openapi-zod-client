import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";

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
    },
    ssr: {
        external: ["handlebars", "tanu", "whence"],
        // This is required to fix ESM/CJS incompatibilities
        noExternal: ["@emotion/styled"],
    },
});
