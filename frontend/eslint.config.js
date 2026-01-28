import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import unicorn from "eslint-plugin-unicorn";

import tanstackQuery from "@tanstack/eslint-plugin-query";
import jsxA11y from "eslint-plugin-jsx-a11y";
import vitest from "eslint-plugin-vitest";

export default tseslint.config(
  // Global ignores
  {
    ignores: ["dist", "**/*.config.{js,ts}", "**/routeTree.gen.ts"],
  },

  // App source (TS / TSX)
  {
    files: ["**/*.{ts,tsx}"],

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],

    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
      unicorn,
      "@tanstack/query": tanstackQuery,
      "jsx-a11y": jsxA11y,
    },

    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.app.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // Imports (AUTO-FIX)
      "simple-import-sort/imports": [
        "error",
        {
          groups: [["^react", "^@?\\w"], ["^@/"], ["^\\."], ["^.+\\.s?css$"]],
        },
      ],

      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "error",

      // TypeScript (type-aware)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: true },
      ],

      // React
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/jsx-key": "error",
      "react/self-closing-comp": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "warn",
      "react/jsx-no-leaked-render": "error",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",

      // TanStack Query
      "@tanstack/query/exhaustive-deps": "error",
      "@tanstack/query/no-rest-destructuring": "warn",
      "@tanstack/query/stable-query-client": "error",

      // Accessibility
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",

      // Code quality
      "unicorn/consistent-function-scoping": "warn",
      "unicorn/no-null": "off",

      // DX / Safety
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "require-await": "error",
      "no-await-in-loop": "warn",
    },

    settings: {
      react: { version: "detect" },
    },
  },

  // Tests (Vitest)
  {
    files: ["**/*.{test,spec}.{ts,tsx}"],

    plugins: {
      vitest,
    },

    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "vitest/no-focused-tests": "error",
      "vitest/no-disabled-tests": "warn",
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  }
);
