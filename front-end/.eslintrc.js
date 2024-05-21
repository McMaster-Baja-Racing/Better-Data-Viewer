module.exports = {

  'env': {
    'browser': true,
    'es2021': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  'overrides': [
    {
      'files': ['*.ts', '*.tsx'],
      'parser': '@typescript-eslint/parser',
      'parserOptions': {
        'ecmaVersion': 12,
        'sourceType': 'module'
      },
      'plugins': ['@typescript-eslint'],
      'extends': [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
      ]
    },
    {
      'env': {
        'node': true
      },
      'files': [
        '.eslintrc.{js,cjs}'
      ],
      'parserOptions': {
        'sourceType': 'script'
      }
    }
  ],
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module'
  },
  'plugins': [
    'react'
  ],
  'rules': {
    'indent': [
      'error',
      2,  
      { 'SwitchCase': 1 }
    ],
    'linebreak-style': 'off',
    'quotes': [
      'warn',
      'single'
    ],
    'semi': [
      'warn',
      'always'
    ],
    'max-len': [
      'warn',
      { 'code': 120 }
    ],
    'react/prop-types': 'off' // disable react/prop-types rule temporarily, until we figure this out
  }
};