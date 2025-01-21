import { BaseCRTOptions, CoolRetroHyperConfiguration } from './types'

export const defaultConfiguration: Required<
  Omit<CoolRetroHyperConfiguration, 'crt'>
> & {
  crt: BaseCRTOptions
} = {
  crt: {
    bloom: 2, // 0 ~ 5
    burnInTime: 0.4,
    jitter: 0.8,
    screenCurvature: 0.1,
    noise: 0.4,
    glowingLine: 0.75,
    flickering: 0.2,
    ambientLight: 0.5,
    pixelHeight: 6.0,
    pixelization: false,
    rgbSplit: 0.25,
    rgbSplitXDistance: 0.13,
    rgbSplitYDistance: 0.08,
    bazelSize: 0.12,
    frameColor: '#191919',
  },
  disableGUIConfig: false,
  fps: 60,
  shaderPaths: [],
}
