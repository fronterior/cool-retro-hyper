import * as THREE from 'three'
import { Effect, BlendFunction, CopyPass, BloomEffect } from 'postprocessing'
import { EffectPass } from 'postprocessing'
import type * as glsl from './glsl'
import type { CoolRetroHyperConfiguration, CRTEffect } from './types'

export const defaultCRTOptions = {
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
  bazelSize: 0.4,
}

type CreateCRTEffectParameters = {
  options: CoolRetroHyperConfiguration
  noiseTexture: THREE.Texture
  userEffectPasses: EffectPass[]
  glslEffects: typeof glsl
}

export function createCRTEffect({
  options,
  noiseTexture,
  userEffectPasses,
  glslEffects,
}: CreateCRTEffectParameters): CRTEffect {
  const saveTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    { format: THREE.RGBAFormat, stencilBuffer: false },
  )
  const savePass = new CopyPass(saveTarget)

  const burnInTime = options.crt?.burnInTime ?? defaultCRTOptions.burnInTime
  const bloom = options.crt?.bloom ?? defaultCRTOptions.bloom
  const jitter = options.crt?.jitter ?? defaultCRTOptions.jitter
  const screenCurvature =
    options.crt?.screenCurvature ?? defaultCRTOptions.screenCurvature
  const noise = options.crt?.noise ?? defaultCRTOptions.noise
  const glowingLine = options.crt?.glowingLine ?? defaultCRTOptions.glowingLine
  const flickering = options.crt?.flickering ?? defaultCRTOptions.flickering
  const ambientLight =
    options.crt?.ambientLight ?? defaultCRTOptions.ambientLight
  const pixelHeight = options.crt?.pixelHeight ?? defaultCRTOptions.pixelHeight
  const pixelization =
    options.crt?.pixelization ?? defaultCRTOptions.pixelization
  const rgbSplit = options.crt?.rgbSplit ?? defaultCRTOptions.rgbSplit
  const rgbSplitXDistance =
    options.crt?.rgbSplitXDistance ?? defaultCRTOptions.rgbSplitXDistance
  const rgbSplitYDistance =
    options.crt?.rgbSplitYDistance ?? defaultCRTOptions.rgbSplitYDistance
  const bazelSize = options.crt?.bazelSize ?? defaultCRTOptions.bazelSize

  const burnInEffect = new Effect('burn-in', glslEffects.burnIn, {
    blendFunction: BlendFunction.NORMAL,
    uniforms: new Map<string, THREE.Uniform<unknown>>([
      ['burnInSource', new THREE.Uniform(saveTarget.texture)],
      ['burnInTime', new THREE.Uniform(burnInTime)],
    ]),
  })

  const retroEffect = new Effect('retro', glslEffects.retro, {
    blendFunction: BlendFunction.NORMAL,
    uniforms: new Map<string, THREE.Uniform<unknown>>([
      ['fontColor', new THREE.Uniform(new THREE.Vector3(1, 1, 1))],
      ['chromaColor', new THREE.Uniform(2.5)],
      ['staticNoise', new THREE.Uniform(noise * 0.1)],
      ['noiseSource', new THREE.Uniform(1.01)],
      [
        'jitter',
        new THREE.Uniform(new THREE.Vector2(0.001 * jitter, 0.001 * jitter)),
      ],
      ['glowingLine', new THREE.Uniform(glowingLine * 0.1)],
      ['flickering', new THREE.Uniform(flickering)],
      ['ambientLight', new THREE.Uniform(ambientLight * 0.001)],
      ['pixelHeight', new THREE.Uniform(pixelHeight)],
      ['pixelization', new THREE.Uniform(pixelization)],
      ['rgbSplit', new THREE.Uniform(rgbSplit)],
      ['rgbSplitXDistance', new THREE.Uniform(rgbSplitXDistance * 0.01)],
      ['rgbSplitYDistance', new THREE.Uniform(rgbSplitYDistance * 0.01)],
    ]),
  })

  const noiseSource = retroEffect.uniforms.get('noiseSource')
  if (noiseSource) noiseSource.value = noiseTexture

  const bloomEffect = new BloomEffect({
    kernelSize: bloom,
    blendFunction: BlendFunction.LIGHTEN,
  })

  const frameEffect = new Effect('retro-frame', glslEffects.retroFrame, {
    blendFunction: BlendFunction.NORMAL,
    uniforms: new Map<string, THREE.Uniform<unknown>>([
      [
        'frameColor',
        new THREE.Uniform(new THREE.Vector3(25 / 255, 25 / 255, 25 / 255)),
      ],
      ['screenCurvature', new THREE.Uniform(screenCurvature)],
      ['bazelSize', new THREE.Uniform(bazelSize)],
    ]),
  })

  const scaleEffects = [
    new Effect('scale', glslEffects.scale, {
      defines: new Map([['scale', '0.985']]),
    }),
    new Effect('sampling', glslEffects.sampling, {
      blendFunction: BlendFunction.NORMAL,
    }),
  ]

  return {
    passes: [
      new EffectPass(undefined, ...scaleEffects),
      new EffectPass(undefined, bloomEffect),
      ...(burnInEffect ? [new EffectPass(undefined, burnInEffect)] : []),
      ...userEffectPasses,
      new EffectPass(undefined, retroEffect),
      savePass,
      ...(screenCurvature ? [new EffectPass(undefined, frameEffect)] : []),
    ],
    coordinateTransform(x: number, y: number) {
      const cx = x - 0.5
      const cy = y - 0.5

      const dist = (screenCurvature + 0.05) * (cx * cx + cy * cy)

      return [x + cx * (1 + dist) * dist, y + cy * (1 + dist) * dist]
    },
  }
}
