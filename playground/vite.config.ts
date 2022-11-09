import { defineConfig, UserConfig } from "vite";
import compileTime from "vite-plugin-compile-time";
import UnoCSS from "unocss/vite";
import presetIcons from "@unocss/preset-icons";
import { visualizer } from "rollup-plugin-visualizer";
import react from "@vitejs/plugin-react";

// TODO pwa ?
export default defineConfig((env) => {
    const config: UserConfig = {
        plugins: [
            UnoCSS({
                presets: [presetIcons({})],
            }),
            react(),
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
