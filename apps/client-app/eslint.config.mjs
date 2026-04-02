import baseConfig from "../../eslint.config.mjs";
import nx from "@nx/eslint-plugin";

export default [
    {
        ignores: [
            "**/dist",
            "**/out-tsc"
        ]
    },
    ...baseConfig,
    ...nx.configs["flat/react"],
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        // Override or add rules here
        rules: {}
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx"
        ],
        rules: {
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/await-thenable": "error"
        },
        languageOptions: {
            parserOptions: {
                project: [
                    "apps/client-app/tsconfig.*?.json"
                ]
            }
        }
    },
    {
        files: [
            "**/*.js",
            "**/*.jsx"
        ],
        // Override or add rules here
        rules: {}
    },
    {
        files: [
            "**/*.spec.ts",
            "**/*.spec.tsx",
            "**/*.test.ts",
            "**/*.test.tsx"
        ],
        rules: {
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/await-thenable": "off"
        }
    }
];
