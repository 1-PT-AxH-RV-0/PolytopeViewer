import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      'webpack.config.js',
      'postcss.config.js',
      '.stylelintrc.js'
    ]
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:jsdoc/recommended'
  ),
  {
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },

    rules: {
      'comma-dangle': ['error', 'never'],
      'arrow-parens': ['error', 'as-needed'],
      'prefer-arrow-callback': 'error',
      'eol-last': ['error', 'always'],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto'
        }
      ],

      quotes: [
        'error',
        'single',
        {
          avoidEscape: true
        }
      ],

      eqeqeq: ['error', 'always'],
      'no-var': 'error'
    }
  }
];
