// @ts-check
const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
    parserOptions: {
        files: ["*.ts"],
        project: ["./lib/tsconfig.json", "./playground/tsconfig.json"],
    },
    ignorePatterns: ["**/*.test.ts"],
    extends: "@astahmer/eslint-config-ts",
    settings: {
        "import/extensions": [".ts"],
    },
    rules: {
        // "file-progress/activate": 1
        "unicorn/prefer-module": 0,
        "sonarjs/cognitive-complexity": ["warn", 30],
    },
    overrides: [
        {
            files: ["lib/src/index.ts"],
            rules: {
                "import/no-unused-modules": 0,
            },
        },
    ],
});
