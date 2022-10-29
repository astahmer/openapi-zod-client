import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
    plugins: [vanillaExtractPlugin(), rakkas()],
    define: {
        "process.env.TEST": false,
    },
    ssr: {
        external: ["handlebars", "tanu", "whence"],
    },
});
