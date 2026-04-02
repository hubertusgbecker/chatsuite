import baseConfig from "../../eslint.config.mjs";

export default [
    {
        ignores: [
            "**/dist",
            "**/out-tsc"
        ]
    },
    ...baseConfig,
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
                    "apps/api-customer-service/tsconfig.*?.json"
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
            "**/*.test.tsx",
            "tests/**/*.ts"
        ],
        rules: {
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/await-thenable": "off"
        }
    }
];
