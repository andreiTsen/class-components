import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.d.ts',
      'eslint.config.js',
      'lint-staged.config.js',
    ],
  },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  reactPlugin.configs.flat.recommended,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  eslintPluginUnicorn.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          globalReturn: false,
          jsx: true,
        },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      // 'react': react,
      // 'react-hooks': reactHooks,
      // 'react-refresh': reactRefresh,
      // 'import': importPlugin,
      // 'vitest': vitest,
      // 'sort-exports': sortExports,
      // 'import-newlines': importNewlines,
      // '@stylistic': stylistic,
      // 'unicorn': eslintPluginUnicorn,
    },
    linterOptions: {
      noInlineConfig: true,
    },
    rules: {
      // Mandatory
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'explicit', overrides: { constructors: 'off' } },
      ],
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',

      'react-hooks/exhaustive-deps': 'warn',

      // Good practices
      'no-console': ['warn', { allow: ['info', 'error'] }],
      'no-magic-numbers': [
        'error',
        { ignore: [0, 1, 2, -1, 10, 100, 1000, 1_000_000] },
      ],
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'max-lines-per-function': [
        'warn',
        { max: 40, skipBlankLines: true, skipComments: true },
      ],

      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',

      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-top-level-await': 'error',

      // Styles
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      curly: ['error', 'all'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
        },
      ],
      'object-curly-spacing': ['error', 'always'],
      'brace-style': [
        'error',
        '1tbs',
        {
          allowSingleLine: false,
        },
      ],
      'arrow-parens': ['error', 'always'],
      'max-len': ['warn', { code: 120, ignoreComments: true }],

      // Switched off
      'no-undef': 'off',
      'no-restricted-exports': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/number-literal-case': 'off',
      'unicorn/prefer-query-selector': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'max-lines-per-function': [
        'warn',
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
]);
