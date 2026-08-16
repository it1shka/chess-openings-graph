import { defineConfig } from 'oxlint'

export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
    respectEslintDisableDirectives: true,
  },
  categories: {
    correctness: 'error',
    suspicious: 'error',
    // pedantic: 'error',
    perf: 'error',
    // style: 'error',
    // restriction: 'error',
    // nursery: 'error'
  },
})
