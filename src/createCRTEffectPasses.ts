import fs from 'fs'
import path from 'path'
import os from 'os'
import * as THREE from 'three'
import { Effect, BlendFunction, CopyPass, BloomEffect } from 'postprocessing'
import { EffectPass } from 'postprocessing'
import * as glsl from './glsl'
import { CoolRetroHyperConfiguration } from './types'

const userShaderCache: Record<string, Promise<string>> = {}

export async function createCRTEffectPasses(
  options: CoolRetroHyperConfiguration = {},
) {
  const saveTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    { format: THREE.RGBAFormat, stencilBuffer: false },
  )
  const savePass = new CopyPass(saveTarget)

  const burnInEffect = new Effect('burn-in', glsl.burnIn, {
    blendFunction: BlendFunction.NORMAL,
    uniforms: new Map<string, THREE.Uniform<unknown>>([
      ['burnInSource', new THREE.Uniform(saveTarget.texture)],
      ['burnInTime', new THREE.Uniform(0.4)],
    ]),
  })

  const jitter = 0.4
  const screenCurvature = 0.2

  const retroEffect = new Effect('retro', glsl.retro, {
    blendFunction: BlendFunction.NORMAL,
    uniforms: new Map<string, THREE.Uniform<unknown>>([
      ['fontColor', new THREE.Uniform(new THREE.Vector3(1, 1, 1))],
      ['chromaColor', new THREE.Uniform(2.5)],
      ['staticNoise', new THREE.Uniform(0.05)],
      ['noiseSource', new THREE.Uniform(1.01)],
      [
        'jitter',
        new THREE.Uniform(new THREE.Vector2(0.001 * jitter, 0.001 * jitter)),
      ],
      ['glowingLine', new THREE.Uniform(0.075)],
      ['flickering', new THREE.Uniform(0.2)],
      ['ambientLight', new THREE.Uniform(0.0005)],
      ['pixelHeight', new THREE.Uniform(6.0)],
      ['pixelization', new THREE.Uniform(false)],
      ['rbgSplit', new THREE.Uniform(0.25)],
    ]),
  })

  new THREE.TextureLoader().load(
    path.resolve(__dirname, '../src/assets/images/allNoise512.png'),
    (texture) => {
      texture.minFilter = THREE.LinearFilter
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      const noiseSource = retroEffect.uniforms.get('noiseSource')
      if (noiseSource) noiseSource.value = texture
    },
  )

  const bloomEffect = new BloomEffect({
    kernelSize: 3,
    blendFunction: BlendFunction.LIGHTEN,
    // blendFunction: POSTPROCESSING.BlendFunction.AVERAGE,
  })

  const frameEffect = new Effect('retro-frame', glsl.retroFrame, {
    blendFunction: BlendFunction.NORMAL,
    uniforms: new Map<string, THREE.Uniform<unknown>>([
      [
        'frameColor',
        new THREE.Uniform(new THREE.Vector3(25 / 255, 25 / 255, 25 / 255)),
      ],
      ['screenCurvature', new THREE.Uniform(screenCurvature)],
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

      const promise = fs.promises
        .readFile(normalizedPath)
        .then((value) => ({ filePath: glslPath, code: value.toString() }))

      userShaderCache[glslPath] = promise.then(({ code }) => code)

      return promise
    }),
  )

  const userEffectPass = userShaders.map(
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
      new EffectPass(undefined, burnInEffect),
      ...userEffectPass,
      new EffectPass(undefined, retroEffect),
      savePass,
      new EffectPass(undefined, bloomEffect),
      new EffectPass(undefined, frameEffect),
    ],
    coordinateTransform(x: number, y: number) {
      const cx = x - 0.5
      const cy = y - 0.5

      const dist = (screenCurvature + 0.05) * (cx * cx + cy * cy)

      return [x + cx * (1 + dist) * dist, y + cy * (1 + dist) * dist]
    },
  }
}
