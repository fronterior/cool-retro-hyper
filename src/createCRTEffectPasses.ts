import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as THREE from 'three'
import { Effect, BlendFunction, CopyPass, BloomEffect } from 'postprocessing'
import { EffectPass } from 'postprocessing'

class GlslEffect extends Effect {
  constructor(
    name: string,
    options: {
      blendFunction?: BlendFunction
      uniforms?: Map<string, THREE.Uniform<unknown>>
    } = {},
  ) {
    const fragmentShader = readFileSync(
      resolve(__dirname, '../glsl/' + name + '.glsl'),
    ).toString()
    options.blendFunction = options.blendFunction || BlendFunction.NORMAL

    super(name, fragmentShader, options)
  }
}

export function createCRTEffectPasses() {
  const saveTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    { format: THREE.RGBAFormat, stencilBuffer: false },
  )
  const savePass = new CopyPass(saveTarget)

  const burnInEffect = new GlslEffect('burn-in', {
    uniforms: new Map<string, THREE.Uniform<unknown>>([
      ['burnInSource', new THREE.Uniform(saveTarget.texture)],
      ['burnInTime', new THREE.Uniform(0.4)],
    ]),
  })

  const jitter = 0.4
  const screenCurvature = 0.2

  const retroEffect = new GlslEffect('retro', {
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
    resolve(__dirname, '../images/allNoise512.png'),
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

  const frameEffect = new GlslEffect('retro_frame', {
    uniforms: new Map<string, THREE.Uniform<unknown>>([
      [
        'frameColor',
        new THREE.Uniform(new THREE.Vector3(25 / 255, 25 / 255, 25 / 255)),
      ],
      ['screenCurvature', new THREE.Uniform(screenCurvature)],
    ]),
  })

  const scaleEffects = [
    new Effect(
      'scale',
      readFileSync(resolve(__dirname, '../glsl/scale.glsl')).toString(),
      { defines: new Map([['scale', '0.985']]) },
    ),
    new Effect(
      'sampling',
      readFileSync(resolve(__dirname, '../glsl/sampling.glsl')).toString(),
      { blendFunction: BlendFunction.NORMAL },
    ),
  ]

  const shader = new Effect(
    'in-space',
    readFileSync(resolve(__dirname, '../glsl/in-space.glsl')).toString(),
    { blendFunction: BlendFunction.SCREEN },
  )

  // const shader = new POSTPROCESSING.Effect(
  //   "neonwave-sunset",
  //   readFileSync(
  //     resolve(__dirname, "../glsl/neonwave-sunset.glsl")
  //   ).toString(),
  //   { blendFunction: POSTPROCESSING.BlendFunction.SCREEN }
  // );

  return {
    passes: [
      new EffectPass(undefined, ...scaleEffects),
      new EffectPass(undefined, burnInEffect),
      new EffectPass(undefined, shader),
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
