import fs from 'fs'
import path from 'path'
import os from 'os'
import * as THREE from 'three'
import { Effect, BlendFunction, CopyPass, BloomEffect } from 'postprocessing'
import { EffectPass } from 'postprocessing'
import * as glsl from './glsl'
import type { CoolRetroHyperConfiguration, CRTEffect } from './types'

const userShaderCache: Record<string, Promise<string>> = {}

const defaultCRTOptions = {
  burnInTime: 0.4,
  boom: 3, // 0 ~ 5
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

export async function createCRTEffect(
  options: CoolRetroHyperConfiguration = {},
): Promise<CRTEffect> {
  const saveTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    { format: THREE.RGBAFormat, stencilBuffer: false },
  )
  const savePass = new CopyPass(saveTarget)

  const burnInTime = options.crt?.burnInTime ?? defaultCRTOptions.burnInTime
  const boom = options.crt?.boom ?? defaultCRTOptions.boom
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

  const burnInEffect = new Effect('burn-in', glsl.burnIn, {
    blendFunction: BlendFunction.NORMAL,
    uniforms: new Map<string, THREE.Uniform<unknown>>([
      ['burnInSource', new THREE.Uniform(saveTarget.texture)],
      ['burnInTime', new THREE.Uniform(burnInTime)],
    ]),
  })

  const retroEffect = new Effect('retro', glsl.retro, {
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

  await new Promise<void>((res) => {
    new THREE.TextureLoader().load(
      path.resolve(__dirname, '../src/assets/images/allNoise512.png'),
      (texture) => {
        texture.minFilter = THREE.LinearFilter
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        const noiseSource = retroEffect.uniforms.get('noiseSource')
        if (noiseSource) noiseSource.value = texture

        res()
      },
    )
  })

  const bloomEffect = new BloomEffect({
    kernelSize: boom,
    blendFunction: BlendFunction.LIGHTEN,
  })

  const frameEffect = new Effect('retro-frame', glsl.retroFrame, {
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
    new Effect('scale', glsl.scale, { defines: new Map([['scale', '0.985']]) }),
    new Effect('sampling', glsl.sampling, {
      blendFunction: BlendFunction.NORMAL,
    }),
  ]

  const userShaders = await Promise.all(
    (options.shaderPaths ?? []).map((glslPath: string) => {
      if (glslPath in userShaderCache) {
        return userShaderCache[glslPath]!.then((code) => ({
          filePath: glslPath,
          code,
        }))
      }

      const resolvedPath = glslPath.replace(/^~/, os.homedir())
      const normalizedPath = path.normalize(resolvedPath)

      const promise = fs.promises.readFile(normalizedPath).then((value) => {
        let code = value.toString().replaceAll(/^.*#define PI .*$/gm, '')

        if (code.includes('@shadertoy')) {
          code =
            code
              .replaceAll('iTime', 'time')
              .replaceAll('iResolution', 'resolution')
              .replace('mainImage', 'coolRetroHyperShadertoyMainImage') +
            `\nvoid mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 fragColor) { vec2 fragCoord = uv * resolution.xy; coolRetroHyperShadertoyMainImage(fragColor, fragCoord); }`
        }

        return {
          filePath: glslPath,
          code,
        }
      })

      userShaderCache[glslPath] = promise.then(({ code }) => code)

      return promise
    }),
  )

  const userEffectPasses = userShaders.map(
    ({ filePath, code }) =>
      new EffectPass(
        undefined,
        new Effect(filePath.split('/').pop()!, code, {
          blendFunction: BlendFunction.SCREEN,
        }),
      ),
  )

  return {
    passes: [
      new EffectPass(undefined, ...scaleEffects),
      ...(burnInEffect ? [new EffectPass(undefined, burnInEffect)] : []),
      ...userEffectPasses,
      new EffectPass(undefined, retroEffect),
      savePass,
      new EffectPass(undefined, bloomEffect),
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
