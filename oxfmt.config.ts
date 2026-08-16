import { defineConfig } from 'oxfmt'

export default defineConfig({
  printWidth: 100,
  semi: false,
  singleQuote: true,
  // Conflicts with linter
  sortImports: false,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
})
