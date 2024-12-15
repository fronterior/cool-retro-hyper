import { EffectPass } from 'postprocessing'
import { EffectComposer, Pass, RenderPass } from 'postprocessing'
import {
  CanvasTexture,
  Clock,
  IUniform,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'
import { Terminal } from 'xterm'

export type ConnectOptions = {
  fps?: number
  shaderPaths?: string[]
}

export class XTermConnector {
  private canvas = Object.assign(document.createElement('canvas'), {
    className: 'cool-retro-hyper',
  })
  private scene = new Scene()
  private renderer = new WebGLRenderer({
    canvas: this.canvas,
    preserveDrawingBuffer: true,
    alpha: true,
  })
  private camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 1000)
  private composer = new EffectComposer(this.renderer)
  private clock = new Clock(true)
  private renderPasse = new RenderPass(this.scene, this.camera)
  private shaderPasses: Pass[] = []
  private passes: Pass[] = []
  private screenElement: HTMLElement

  private cancelDraw = () => {}
  private resetScreenElementOpacity = () => {}
  private coordinateTransform = (x: number, y: number) => [x, y] as const

  private options: ConnectOptions = {}

  constructor() {
    // event
    // this.proxyEvents()
    console.log(
      `document.getElementById('hyper')`,
      document.getElementById('hyper'),
    )

    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.camera.position.z = 1

    // debounce
    window.addEventListener('resize', this.syncSize.bind(this))
  }

  private syncSize() {
    const { offsetWidth = 1, offsetHeight = 1 } = this.screenElement ?? {}
    const { devicePixelRatio } = window
    console.log('[syncSize]', offsetWidth, offsetHeight)

    this.composer.setSize(offsetWidth, offsetHeight)
    console.log(
      'offsetWidth',
      offsetWidth,
      'offsetHeight',
      offsetHeight,
      'dpRatio',
      devicePixelRatio,
      offsetWidth * devicePixelRatio,
      offsetHeight * devicePixelRatio,
    )

    const uniformValues = {
      aspect: offsetWidth / offsetHeight,
      resolution: new Vector2(
        offsetWidth * devicePixelRatio,
        offsetHeight * devicePixelRatio,
      ),
    }
    console.log('uniformValues', uniformValues)

    for (const [uniformKey, uniformValue] of Object.entries(uniformValues)) {
      for (const pass of this.shaderPasses) {
        const material = pass.fullscreenMaterial as ShaderMaterial

        const uniform = material.uniforms[uniformKey]
        if (uniform) {
          uniform.value = uniformValue
        }
      }
    }
  }

  private setPasses(passes: Pass[]) {
    const { composer } = this
    composer.removeAllPasses()
    for (const pass of this.passes) {
      pass.dispose()
    }

    composer.addPass(this.renderPasse)
    if (passes.length) {
      passes[passes.length - 1]!.renderToScreen = true
      for (const pass of passes) {
        composer.addPass(pass)
      }
    }

    this.shaderPasses = passes.filter(
      (pass) => pass instanceof Pass && !(pass instanceof EffectPass),
    )
  }

  connect(xTerm: Terminal, passes: Pass[], options: ConnectOptions) {
    console.log('[connect]')
    document.getElementById('hyper')?.append(this.canvas)

    this.resetScreenElementOpacity()

    this.setPasses(passes)
    this.options = options
    this.passes = passes
    this.screenElement = xTerm._core.screenElement

    this.resetScreenElementOpacity = (() => {
      const opacity = this.screenElement.style.opacity

      return () => {
        this.screenElement.style.opacity = opacity
      }
    })()
    this.screenElement.style.opacity = '0'

    const xTermCanvasElements =
      this.screenElement.getElementsByTagName('canvas')

    const xTermLayers = Array.from(xTermCanvasElements, (canvas) => {
      const { zIndex } = window.getComputedStyle(canvas)

      return {
        canvas,
        zIndex: zIndex === 'auto' ? 0 : Number(zIndex) || 0,
      }
    })
      .sort((a, b) => a.zIndex - b.zIndex)
      .map(({ canvas }) => canvas)

    this.scene.clear()

    for (const [i, xTermLayer] of xTermLayers.entries()) {
      const geometry = new PlaneGeometry(1, 1)
      const material = new MeshBasicMaterial({ transparent: true })

      const mesh = new Mesh(geometry, material)
      mesh.position.z = -xTermLayers.length + i
      this.scene.add(mesh)

      const texture = new CanvasTexture(xTermLayer)
      texture.minFilter = LinearFilter

      // debounce
      mesh.material.map = texture

      this.syncSize()
      this.start()
    }
  }

  start() {
    console.log('[render]')
    this.cancelDraw()

    const materials = Array.from(
      this.scene.children,
      (mesh) => (mesh as Mesh).material as MeshBasicMaterial,
    )

    const timeUniforms = this.shaderPasses.reduce<IUniform<number>[]>(
      (acc, pass) => {
        const material = pass.fullscreenMaterial as ShaderMaterial
        if (!material.uniforms.time) {
          return acc
        }

        acc.push(material.uniforms.time)

        return acc
      },
      [],
    )

    console.log('materials, timeUniforms', materials, timeUniforms)

    const fps = 1000 / (this.options.fps ?? 60)
    const { clock, composer } = this

    let previousTime = 0
    let requestAnimationFrameId = requestAnimationFrame(function draw(time) {
      // console.log('[draw]')
      const dist = time - previousTime
      if (dist < fps) {
        requestAnimationFrame(draw)
        return
      }
      previousTime = time

      for (const timeUniform of timeUniforms) {
        timeUniform.value = clock.getElapsedTime()
      }

      for (const material of materials) {
        material.map!.needsUpdate = true
      }

      composer.render(clock.getDelta())

      requestAnimationFrameId = requestAnimationFrame(draw)
    })

    this.cancelDraw = function cancelDraw() {
      console.log('[cancelDraw]')
      cancelAnimationFrame(requestAnimationFrameId)
    }
  }

  handleMouse(ev: MouseEvent) {
    if ((ev as MouseEvent & { syntethic: boolean }).syntethic) {
      return
    }

    ev.preventDefault()
    ev.stopPropagation()

    const { clientX, clientY } = ev
    const { width, height, left, bottom } = (
      ev.target as HTMLElement
    ).getBoundingClientRect()

    let x = (clientX - left) / width
    let y = (bottom - clientY) / height

    ;[x, y] = this.coordinateTransform(x, y)

    const copy: Record<string, unknown> = {}
    for (const attr in ev) {
      copy[attr] = ev[attr as keyof MouseEvent]
    }

    ;[copy.clientX, copy.clientY] = [x * width + left, bottom - y * height]

    const clonedEvent = new MouseEvent(copy.type as 'mousedown', copy)
    ;(clonedEvent as MouseEvent & { syntethic: boolean }).syntethic = true
    ;(copy.target as HTMLElement).dispatchEvent(clonedEvent)
  }
}
