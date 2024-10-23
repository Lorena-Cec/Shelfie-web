import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import parserTypeScript from '@typescript-eslint/parser';
import pluginReact from 'eslint-plugin-react';
import pluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    ignores: [
      'node_modules/',
      'build/',
      'dist/',
      '**/.next/**',
      '**/*.test.js',
      '**/*.spec.js',
    ],
    languageOptions: {
      parser: parserTypeScript,
      globals: globals.browser,
    },
    plugins: {
      react: pluginReact,
      '@typescript-eslint': tseslint,
      prettier: pluginPrettier,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs['recommended'].rules,
      ...pluginReact.configs.recommended.rules,
      'prettier/prettier': 'error',
    },
  },
  prettierConfig,
];
