import { defineConfig } from 'oxlint'

export default defineConfig({
  categories: {
    correctness: 'error',
    nursery: 'error',
    pedantic: 'error',
    perf: 'error',
    // Restriction: 'error',
    style: 'error',
    suspicious: 'error',
  },
  env: {
    node: true,
  },
  ignorePatterns: ['specs/*.spec.ts'],
  options: {
    respectEslintDisableDirectives: true,
    typeAware: true,
    typeCheck: true,
  },
  rules: {
    // I want to have separate declarations for each variable, **especially** for functional declarations
    'one-var': ['error', 'never'],
    // I am using 'undefined' instead of 'null' in my code, so this conflicts with other rules such as 'no-null'
    'unicorn/no-useless-undefined': 'off',
  },
})
