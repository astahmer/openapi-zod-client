import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
    plugins: [vanillaExtractPlugin(), rakkas()],
});
