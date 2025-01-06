import path from 'path'
import os from 'os'
import fs from 'fs'
import * as THREE from 'three'
import { EffectPass } from 'postprocessing'
import { Effect } from 'postprocessing'
import { BlendFunction } from 'postprocessing'

export const noiseTexturePromise = new Promise<THREE.Texture>((res) => {
  new THREE.TextureLoader().load(
    path.resolve(__dirname, '../src/assets/images/allNoise512.png'),
    (texture) => {
      texture.minFilter = THREE.LinearFilter
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping

      res(texture)
    },
  )
})

const userShaderCache: Record<string, Promise<string>> = {}

export async function loadUserShaders(shaderPaths: string[]) {
  const userShaders = await Promise.all(
    (shaderPaths ?? []).map((glslPath: string) => {
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

  return userEffectPasses
}
