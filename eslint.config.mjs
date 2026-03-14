import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import destructuring from 'eslint-plugin-destructuring';

export default defineConfig(
  globalIgnores(['build/', 'coverage/', 'node_modules/', '.git/', 'scripts/', '.ruby-lsp/', '.github/']),

  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      js,
    },
    extends: ['js/recommended'],
  },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.strict],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [prettier],
  },

  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      destructuring,
    },
    rules: {
      'no-console': 'error',
      'max-len': ['error', { code: 120, tabWidth: 2 }],
      'curly': ['error', 'all'],
      'no-unused-vars': 'off',

      'destructuring/in-params': ['error', { 'max-params': 0 }],
      'destructuring/no-rename': 'off',

      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variableLike',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-empty-function': 'off', // remove and update later
    },
  },
);
