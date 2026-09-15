import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    ignores: [
      'node_modules/',
      'dist/',
      '.qwen/',
      'eslint.config.js',
      'src/services/sessions/create.js',
    ],
  },
  // ESM files (src, services, tests, config)
  {
    files: ['src/**/*.js', 'tests/**/*.js', '*.js', 'vitest.config.js'],
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'prefer-const': 'off',
      'no-var': 'error',
    },
  },
];
