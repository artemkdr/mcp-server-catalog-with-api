import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import globals from 'globals';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';

const compat = new FlatCompat({
    baseDirectory: path.resolve(),
    recommendedConfig: js.configs.recommended,
    allConfigs: js.allConfigs,
});

export default defineConfig([
    {
        extends: compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended'),
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },

        languageOptions: {
            globals: {
                ...globals.node,
            },

            parser: tsParser,
            ecmaVersion: 2023,
            sourceType: 'module',
        },

        rules: {},
    },
]);
