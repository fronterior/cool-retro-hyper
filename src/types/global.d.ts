import type { IpcRenderer } from 'electron'
import type { CoolRetroHyperConfiguration, HyperState } from '.'

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
    rpc: IpcRenderer
  }
}
