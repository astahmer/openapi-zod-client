import { defineConfig, UserConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import compileTime from "vite-plugin-compile-time";
import UnoCSS from "unocss/vite";
import presetIcons from "@unocss/preset-icons";
import { visualizer } from "rollup-plugin-visualizer";

// TODO pwa ?
export default defineConfig((env) => {
    const config: UserConfig = {
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
                "pastable/server": "pastable",
                // "openapi-zod-client": path.resolve(__dirname, "../lib"),
            },
        },
    };

    if (env.command === "build" && env.ssrBuild) {
        if (Array.isArray(config.ssr!.noExternal)) {
            config.ssr!.noExternal.push("@saas-ui/react", "@chakra-ui/react", "@chakra-ui/styled-system");
        }
    }

    if (process.env.VIZ && env.command === "build" && !env.ssrBuild) {
        config.plugins!.push(visualizer({ open: true }) as any);
    }

    return config;
});
