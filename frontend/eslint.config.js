import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

import tanstackQuery from '@tanstack/eslint-plugin-query';
import vitest from 'eslint-plugin-vitest';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist', '**/*.config.{js,ts}', '**/routeTree.gen.ts'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // App source (TS / TSX)
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
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
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
      'unused-imports/no-unused-imports': 'error',

      // TypeScript
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],

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
    },
  },

  // Tests (Vitest)
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
  prettier,
];
