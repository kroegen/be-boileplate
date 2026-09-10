import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    ignores: ['node_modules/', 'dist/', '.qwen/', 'eslint.config.js', 'src/services/sessions/create.js'],
  },
  // CommonJS source files
  {
    files: ['src/**/*.js', '!src/services/**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'prefer-const': 'off',
      'no-var': 'error',
    },
  },
  // ESM files (services, tests, config)
  {
    files: ['src/services/**/*.js', 'tests/**/*.js', '*.js', 'vitest.config.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'prefer-const': 'off',
      'no-var': 'error',
    },
  },
];
