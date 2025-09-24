import js from '@eslint/js';
import jest from 'eslint-plugin-jest';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 13,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Phaser: 'readonly',
        firebase: 'readonly',
      },
    },
    plugins: {
      jest,
    },
    rules: {
      // Reglas básicas de estilo
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'no-trailing-spaces': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': ['error', 'always'],
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'eol-last': 'error',
      'no-mixed-operators': 'error',
      'no-plusplus': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'arrow-spacing': 'error',
      'no-duplicate-imports': 'error',
      'import/no-duplicates': 'off', // Desactivamos esta regla ya que no tenemos el plugin
    },
  },
  {
    files: ['**/*.spec.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        ...jest.environments.globals.globals,
      },
    },
    rules: {
      'no-unused-vars': 'off', // Jest puede usar variables no utilizadas
    },
  },
];
