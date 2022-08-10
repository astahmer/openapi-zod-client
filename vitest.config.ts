/// <reference types="vitest" />

import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
    test: {
        include: ["src/*.test.ts"],
        // include: ["src/**/*.test.ts"],
        // includeSource: ["src/**/*.ts"],
        snapshotFormat: { indent: 4, escapeString: false },
    },
});
