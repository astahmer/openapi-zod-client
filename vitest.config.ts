/// <reference types="vitest" />

import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
    test: {
        include: ["src/*.test.ts", "tests/*.test.ts"],
        snapshotFormat: { indent: 4, escapeString: false },
    },
});
