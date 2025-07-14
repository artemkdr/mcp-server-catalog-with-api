import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import globals from 'globals';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';

const compat = new FlatCompat({
    baseDirectory: path.resolve(),
    recommendedConfig: js.configs.recommended,
    allConfigs: js.allConfigs,
});

export default defineConfig([
    {
        extends: compat.extends(
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended',
            'plugin:eslint-plugin-prettier/recommended',
        ),
        plugins: {
            '@typescript-eslint': typescriptEslint,
            'eslint-plugin-prettier': prettier,
        },

        languageOptions: {
            globals: {
                ...globals.node,
            },

            parser: tsParser,
            ecmaVersion: 2023,
            sourceType: 'module',
        },

        rules: {
            'prettier/prettier': [
                'error',
                {
                    tabWidth: 4,
                    semi: true,
                    trailingComma: 'all',
                    singleQuote: true,
                    printWidth: 120,
                },
            ],
        },
    },
]);
