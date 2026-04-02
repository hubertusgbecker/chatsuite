import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import nx from "@nx/eslint-plugin";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});


export default [
    {
        ignores: [
            "**/dist",
            "**/out-tsc"
        ]
    },
    ...nx.configs["flat/base"],
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: [],
                    depConstraints: [
                        {
                            sourceTag: "type:app",
                            onlyDependOnLibsWithTags: [
                                "type:lib",
                                "type:util"
                            ]
                        },
                        {
                            sourceTag: "type:lib",
                            onlyDependOnLibsWithTags: [
                                "type:lib",
                                "type:util"
                            ]
                        },
                        {
                            sourceTag: "type:util",
                            onlyDependOnLibsWithTags: [
                                "type:util"
                            ]
                        },
                        {
                            sourceTag: "*",
                            onlyDependOnLibsWithTags: [
                                "*"
                            ]
                        }
                    ]
                }
            ],
            eqeqeq: [
                "error",
                "always"
            ],
            "no-var": "error",
            "prefer-const": "error"
        }
    },
    ...nx.configs["flat/typescript"],
    ...compat.config({
        extends: [
            "plugin:security/recommended-legacy"
        ],
        plugins: [
            "@microsoft/eslint-plugin-sdl"
        ]
    }).map(config => ({
        ...config,
        files: [
            "**/*.ts",
            "**/*.tsx"
        ],
        rules: {
            ...config.rules,
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-type": [
                "warn",
                {
                    allowExpressions: true,
                    allowTypedFunctionExpressions: true,
                    allowHigherOrderFunctions: true,
                    allowDirectConstAssertionInArrowFunctions: true
                }
            ],
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_"
                }
            ],
            "@typescript-eslint/no-shadow": "error",
            "no-console": [
                "warn",
                {
                    allow: [
                        "warn",
                        "error"
                    ]
                }
            ],
            "@microsoft/sdl/no-insecure-url": "warn"
        }
    })),
    ...nx.configs["flat/javascript"],
    {
        files: [
            "**/*.spec.ts",
            "**/*.spec.tsx",
            "**/*.test.ts",
            "**/*.test.tsx",
            "tests/**/*.ts"
        ],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-shadow": "off"
        }
    }
];
