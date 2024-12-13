import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as THREE from 'three'
import * as POSTPROCESSING from 'postprocessing'

class GlslEffect extends POSTPROCESSING.Effect {
  constructor(
    name: string,
    options: {
      blendFunction?: POSTPROCESSING.BlendFunction
      uniforms?: Map<string, THREE.Uniform<unknown>>
    } = {},
  ) {
    const fragmentShader = readFileSync(
      resolve(__dirname, '../glsl/' + name + '.glsl'),
    ).toString()
    options.blendFunction =
      options.blendFunction || POSTPROCESSING.BlendFunction.NORMAL

    super(name, fragmentShader, options)
  }
}

export function createCRTEffectPasses() {
  const saveTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    { format: THREE.RGBAFormat, stencilBuffer: false },
  )
  const savePass = new POSTPROCESSING.CopyPass(saveTarget)

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
      ['rbgSplit', new THREE.Uniform(0.4)], // 글씨 나눠지는 효과, 눈아픔
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

  const bloomEffect = new POSTPROCESSING.BloomEffect({
    kernelSize: 3,
    distinction: 0.5,
    blendFunction: POSTPROCESSING.BlendFunction.LIGHTEN,
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

  function coordinateTransform(x: number, y: number) {
    x -= 0.5
    y -= 0.5

    let dist = screenCurvature * (x * x + y * y)
    dist *= 1.0 + dist

    return [x * dist + x + 0.5, y * dist + y + 0.5]
  }

  const scaleEffects = []

  // scale
  scaleEffects.push(
    new POSTPROCESSING.Effect(
      'scale',
      readFileSync(resolve(__dirname, '../glsl/scale.glsl')).toString(),
      { defines: new Map([['scale', '0.99']]) },
    ),
  )

  // avoid sampling issues
  scaleEffects.push(
    new POSTPROCESSING.Effect(
      'sampling',
      readFileSync(resolve(__dirname, '../glsl/sampling.glsl')).toString(),
      { blendFunction: POSTPROCESSING.BlendFunction.NORMAL },
    ),
  )

  // // bloom
  // spaceEffects.push(
  //   new POSTPROCESSING.BloomEffect({
  //     kernelSize: 3,
  //     distinction: -0.5,
  //   })
  // );

  // const shader = new POSTPROCESSING.Effect(
  //   "ethereal-whispers",
  //   readFileSync(
  //     resolve(__dirname, "../glsl/ethereal-whispers.glsl")
  //   ).toString(),
  //   { blendFunction: POSTPROCESSING.BlendFunction.SCREEN }
  // );
  // const shader = new POSTPROCESSING.Effect(
  //   "rain",
  //   readFileSync(resolve(__dirname, "../glsl/rain.glsl")).toString(),
  //   { blendFunction: POSTPROCESSING.BlendFunction.SCREEN }
  // );
  // const shader = new POSTPROCESSING.Effect(
  //   "zippy-zaps",
  //   readFileSync(resolve(__dirname, "../glsl/zippy-zaps.glsl")).toString(),
  //   { blendFunction: POSTPROCESSING.BlendFunction.SCREEN }
  // );
  // const shader = new POSTPROCESSING.Effect(
  //   "gyroids",
  //   readFileSync(resolve(__dirname, "../glsl/gyroids.glsl")).toString(),
  //   { blendFunction: POSTPROCESSING.BlendFunction.SCREEN }
  // );
  // const shader = new POSTPROCESSING.Effect(
  //   "bubble-rings",
  //   readFileSync(resolve(__dirname, "../glsl/bubble-rings.glsl")).toString(),
  //   { blendFunction: POSTPROCESSING.BlendFunction.SCREEN }
  // );
  // const shader = new POSTPROCESSING.Effect(
  //   "ui-noise-halo",
  //   readFileSync(
  //     resolve(__dirname, "../glsl/ui-noise-halo.glsl")
  //   ).toString(),
  //   { blendFunction: POSTPROCESSING.BlendFunction.SCREEN }
  // );
  const shader = new POSTPROCESSING.Effect(
    'in-space',
    readFileSync(resolve(__dirname, '../glsl/in-space.glsl')).toString(),
    { blendFunction: POSTPROCESSING.BlendFunction.SCREEN },
  )
  // const shader = new POSTPROCESSING.Effect(
  //   "kirby-jump",
  //   readFileSync(resolve(__dirname, "../glsl/kirby-jump.glsl")).toString(),
  //   { blendFunction: POSTPROCESSING.BlendFunction.SCREEN }
  // );
  // const shader = new POSTPROCESSING.Effect(
  //   "new-colorful-galaxy",
  //   readFileSync(
  //     resolve(__dirname, "../glsl/new-colorful-galaxy.glsl")
  //   ).toString(),
  //   { blendFunction: POSTPROCESSING.BlendFunction.SCREEN }
  // );
  // const shader = new POSTPROCESSING.Effect(
  //   "neonwave-sunset",
  //   readFileSync(
  //     resolve(__dirname, "../glsl/neonwave-sunset.glsl")
  //   ).toString(),
  //   { blendFunction: POSTPROCESSING.BlendFunction.SCREEN }
  // );

  return {
    passes: [
      new POSTPROCESSING.EffectPass(undefined, ...scaleEffects),
      new POSTPROCESSING.EffectPass(undefined, shader),
      new POSTPROCESSING.EffectPass(undefined, burnInEffect),
      savePass,
      new POSTPROCESSING.EffectPass(undefined, retroEffect),
      new POSTPROCESSING.EffectPass(undefined, bloomEffect),
      new POSTPROCESSING.EffectPass(undefined, frameEffect),
    ],
    coordinateTransform,
    three: THREE,
    postprocessing: POSTPROCESSING,
  }
}
