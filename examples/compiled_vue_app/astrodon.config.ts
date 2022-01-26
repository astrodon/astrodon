import type { AppOptions } from '../../mod.ts'

export default <AppOptions> {
  name: 'vue_astrodon_example',
  version: '0.0.1',
  build: {
    entry: './mod.ts',
    out: './dist',
    assets: './renderer/dist',
    
  },
}