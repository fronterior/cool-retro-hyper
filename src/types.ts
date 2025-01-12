import { Pass } from 'postprocessing'
import type { FontWeight, Terminal } from 'xterm'

export type CoolRetroHyperConfiguration = {
  fps?: number
  shaderPaths?: string[]
  crt?: {
    bloom?: number
    burnInTime?: number
    jitter?: number
    screenCurvature?: number
    noise?: number
    glowingLine?: number
    flickering?: number
    ambientLight?: number
    pixelHeight?: number
    pixelization?: boolean
    rgbSplit?: number
    rgbSplitXDistance?: number
    rgbSplitYDistance?: number
    bazelSize?: number
  }
}

export type CRTEffect = {
  passes: Pass[]
  coordinateTransform?: (x: number, y: number) => [number, number]
}

// https://github.com/vercel/hyper/blob/2a7bb18259d975f27b30b502af1be7576f6f5656/typings/config.d.ts
export type ITermGroup = {
  uid: string
  sessionUid: string | null
  parentUid: string | null
  direction: 'HORIZONTAL' | 'VERTICAL' | null
  sizes: number[] | null
  children: string[]
}

export type ITermGroups = Record<string, ITermGroup>

export type ITermState = {
  termGroups: ITermGroups
  activeSessions: Record<string, string>
  activeRootGroup: string | null
}

export type cursorShapes = 'BEAM' | 'UNDERLINE' | 'BLOCK'

export type uiState = {
  _lastUpdate: number | null
  activeUid: string | null
  activityMarkers: Record<string, boolean>
  backgroundColor: string
  bell: 'SOUND' | false
  bellSoundURL: string | null
  bellSound: string | null
  borderColor: string
  // colors: ColorMap
  cols: number | null
  copyOnSelect: boolean
  css: string
  cursorAccentColor: string
  cursorBlink: boolean
  cursorColor: string
  cursorShape: cursorShapes
  cwd?: string
  disableLigatures: boolean
  fontFamily: string
  fontSize: number
  fontSizeOverride: null | number
  fontSmoothingOverride: string
  fontWeight: FontWeight
  fontWeightBold: FontWeight
  foregroundColor: string
  fullScreen: boolean
  imageSupport: boolean
  letterSpacing: number
  lineHeight: number
  macOptionSelectionMode: string
  maximized: boolean
  messageDismissable: null | boolean
  messageText: string | null
  messageURL: string | null
  modifierKeys: {
    altIsMeta: boolean
    cmdIsMeta: boolean
  }
  notifications: {
    font: boolean
    message: boolean
    resize: boolean
    updates: boolean
  }
  openAt: Record<string, number>
  padding: string
  quickEdit: boolean
  resizeAt: number
  rows: number | null
  screenReaderMode: boolean
  scrollback: number
  selectionColor: string
  showHamburgerMenu: boolean | ''
  showWindowControls: boolean | 'left' | ''
  termCSS: string
  uiFontFamily: string
  updateCanInstall: null | boolean
  updateNotes: string | null
  updateReleaseUrl: string | null
  updateVersion: string | null
  webGLRenderer: boolean
  webLinksActivationKey: 'ctrl' | 'alt' | 'meta' | 'shift' | ''
  // windowsPty?: IWindowsPty
  defaultProfile: string
  // profiles: configOptions['profiles']
}

export type session = {
  cleared: boolean
  cols: number | null
  pid: number | null
  resizeAt?: number
  rows: number | null
  search: boolean
  shell: string | null
  title: string
  uid: string
  splitDirection?: 'HORIZONTAL' | 'VERTICAL'
  activeUid?: string
  profile: string
}

export type sessionState = {
  sessions: Record<string, session>
  activeUid: string | null
  write?: any
}

export type HyperState = {
  ui: uiState
  sessions: sessionState
  termGroups: ITermState
}

// https://github.com/vercel/hyper/blob/2a7bb18259d975f27b30b502af1be7576f6f5656/lib/components/terms.tsx#L17
export interface Terms {
  terms: Record<string, Term>
}

// https://github.com/vercel/hyper/blob/2a7bb18259d975f27b30b502af1be7576f6f5656/lib/components/term.tsx#L100
export interface Term {
  termRef: HTMLElement | null
  termWrapperRef: HTMLElement | null
  // termOptions: ITerminalOptions;
  // disposableListeners: IDisposable[];
  defaultBellSound: HTMLAudioElement | null
  bellSound: HTMLAudioElement | null
  // fitAddon: FitAddon;
  // searchAddon: SearchAddon;
  term: Terminal
  // resizeObserver!: ResizeObserver;
  // resizeTimeout!: NodeJS.Timeout;
  // searchDecorations: ISearchDecorationOptions;
}
