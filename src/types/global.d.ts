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

declare module 'xterm' {
  interface Terminal {
    _core: {
      screenElement: HTMLElement
    }
  }
}

declare module 'electron' {
  interface BrowserWindow {
    rpc: IpcMain
  }
}
