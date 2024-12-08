import { CoolRetroHyperConfiguration, HyperState } from "src/types"

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

export { }
