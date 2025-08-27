module.exports = {
  extends: [
    'expo'
  ],
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'warn',
    'prefer-const': 'warn'
  },
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};