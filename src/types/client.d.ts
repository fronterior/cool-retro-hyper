declare module '*.glsl' {
  const value: string
  export default value
}

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
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
