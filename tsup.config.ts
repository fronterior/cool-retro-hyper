import { defineConfig } from 'tsup'

export default defineConfig({
  loader: {
    '.glsl': 'text',
    '.css': 'local-css',
  },
  // esbuildPlugins: [cssModulesPlugin()],
})
