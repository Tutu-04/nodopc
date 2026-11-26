import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules', 'coverage', 'uploads', 'dist'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  }
);
