import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import xoTypeScript from 'eslint-config-xo-typescript';

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';

import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

import tanstackQuery from '@tanstack/eslint-plugin-query';
import vitest from 'eslint-plugin-vitest';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintConfigPrettierPlugin from 'eslint-config-prettier/prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: ['dist', '**/*.config.{js,ts}', '**/routeTree.gen.ts'],
  },

  // ── Base configs ──────────────────────────────────────────────
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...xoTypeScript,

  // ── React ─────────────────────────────────────────────────────
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,

  // ── App source (TS / TSX) ─────────────────────────────────────
  {
    files: ['**/*.{ts,tsx}'],

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      '@tanstack/query': tanstackQuery,
    },

    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },

    settings: {
      react: { version: 'detect' },
    },

    rules: {
      // Imports (AUTO-FIX)
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^react', '^@?\\w'], ['^@/'], ['^\\.'], ['^.+\\.s?css$']],
        },
      ],
      'simple-import-sort/exports': 'error',

      // TypeScript 
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
      // 
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-restricted-types': 'off',

      // React
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TanStack Query
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn',
      '@tanstack/query/stable-query-client': 'error',

      // DX / Safety
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-await-in-loop': 'warn',
      'capitalized-comments': 'off',
    },
  },

  // ── Tests (Vitest) ────────────────────────────────────────────
  {
    files: ['**/*.{test,spec}.{ts,tsx}'],

    plugins: {
      vitest,
    },

    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'warn',
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // ── Prettier (must be last) ───────────────────────────────────
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      ...eslintConfigPrettierPlugin.rules,
      'prettier/prettier': [
        'error',
        /** @type {import('prettier').Options} */ ({
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'all',
          printWidth: 90,
        }),
        { usePrettierrc: false },
      ],
    },
  },
];
