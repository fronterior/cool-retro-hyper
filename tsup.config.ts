import { defineConfig } from 'tsup'

export default defineConfig({
  loader: {
    '.glsl': 'text',
    '.png': 'binary',
  },
  noExternal: ['three', 'postprocessing'],
})
