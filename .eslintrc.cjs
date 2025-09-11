module.exports = {
  root: true,
  ignorePatterns: ['**/dist/**', '**/.next/**'],
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  env: { node: true, es2022: true, browser: true },
  extends: ['eslint:recommended'],
  rules: {}
};