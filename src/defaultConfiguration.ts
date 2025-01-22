import { BaseCRTOptions, CoolRetroHyperConfiguration } from './types'

export const defaultConfiguration: Required<
  Omit<CoolRetroHyperConfiguration, 'crt'>
> & {
  crt: BaseCRTOptions
} = {
  crt: {
    ambientLight: 0.5,
    bazelSize: 0.12,
    bloom: 2, // 0 ~ 5
    burnInTime: 0.4,
    flickering: 0.2,
    frameColor: '#191919',
    glowingLine: 0.75,
    jitter: 0.8,
    noise: 0.4,
    pixelHeight: 6.0,
    pixelization: false,
    rgbSplit: 0.25,
    rgbSplitXDistance: 0.13,
    rgbSplitYDistance: 0.08,
    screenCurvature: 0.1,
  },
  disableGUIConfig: false,
  fps: 60,
  shaderPaths: [],
}
