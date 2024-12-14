import { CoolRetroHyperConfiguration, HyperState } from 'src/types'
import { ShaderMaterial } from 'three'

declare global {
  interface Window {
    config: {
      getConfig(): {
        coolRetroHyper: CoolRetroHyperConfiguration
      }
    }
    store: {
      getState(): HyperState
    }
  }
}

declare module 'xterm' {
  interface Terminal {
    _core: {
      screenElement: HTMLElement
    }
  }
}

declare module 'postprocessing' {
  interface Pass {
    get fullscreenMaterial(): ShaderMaterial
  }
}

export {}
