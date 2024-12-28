import { defineConfig } from 'tsup'

export default defineConfig({
  loader: {
    '.glsl': 'text',
  },
  noExternal: ['three', 'postprocessing'],
})
