import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import compileTime from "vite-plugin-compile-time";
import UnoCSS from "unocss/vite";
import presetIcons from "@unocss/preset-icons";

// TODO pwa ?
export default defineConfig((_env) => ({
    plugins: [
        UnoCSS({
            presets: [presetIcons({})],
        }),
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
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: "globalThis", // for handlebars
                // https://github.com/vitejs/vite/discussions/5912#discussioncomment-3895047
            },
        },
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
}));
