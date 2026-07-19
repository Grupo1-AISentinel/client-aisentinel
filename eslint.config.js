import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'preserve-caught-error': 'off',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  prettierConfig,
]);
