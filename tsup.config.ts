import { defineConfig } from 'tsup'

export default defineConfig({
  loader: {
    '.css': 'local-css',
    '.glsl': 'text',
    '.svg': 'text',
  },
  // esbuildPlugins: [cssModulesPlugin()],
})
