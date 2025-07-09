// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

// TODO: Consider linting with type information
// https://typescript-eslint.io/getting-started/typed-linting
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {rules: {
    'semi': ['warn', 'always'],
    'max-len': ['warn', {code: 120}],
    'quotes': ['warn', 'single'],
    'no-console': 'warn',
    'indent': [
      'error',
      2,  
      { 'SwitchCase': 1 }
    ],
    '@typescript-eslint/no-unused-vars': 'warn',
  }}
);