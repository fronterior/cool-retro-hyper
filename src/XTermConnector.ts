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
import { CRTEffect } from './types'

export type ConnectOptions = {
  fps?: number
  shaderPaths?: string[]
  coordinateTransform?: (x: number, y: number) => [number, number]
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
  private removeMouseHandlers = () => {}
  private coordinateTransform = (x: number, y: number) => [x, y] as const

  private resizeObserver?: ResizeObserver
  private debounceTimeout?: NodeJS.Timeout
  private options: ConnectOptions = {}

  constructor() {
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.camera.position.z = 1
  }

  private setResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout)
      }

      this.debounceTimeout = setTimeout(() => {
        const entry = entries[0]
        if (entry) {
          const { width, height } = entry.contentRect
          this.handleResize(width, height)
        }
      }, 32)
    })

    if (this.screenElement) {
      this.resizeObserver.observe(this.screenElement)
    }
  }

  private handleResize(width: number, height: number) {
    const { devicePixelRatio } = window
    const aspect = width / height

    this.dispose()

    this.renderer.setSize(width, height, false)
    this.composer.setSize(width, height)

    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 1000)
    this.camera.position.z = 1

    const uniformValues = {
      aspect,
      resolution: new Vector2(
        width * devicePixelRatio,
        height * devicePixelRatio,
      ),
    }

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

  getLayers(term: Terminal) {
    const canvasList = term._core.screenElement.getElementsByTagName('canvas')

    return canvasList
  }

  connect(xTerm: Terminal, crtEffect: CRTEffect, options: ConnectOptions) {
    if (!this.canvas.parentNode) {
      document.getElementById('hyper')?.append(this.canvas)
    }

    this.resetScreenElementOpacity()

    this.setPasses(crtEffect.passes)
    this.options = options
    this.passes = crtEffect.passes
    this.screenElement = xTerm._core.screenElement

    this.resetScreenElementOpacity = (() => {
      const opacity = this.screenElement.style.opacity

      return () => {
        this.screenElement.style.opacity = opacity
      }
    })()
    this.screenElement.style.opacity = '0'
    this.setResizeObserver()

    this.connectXTerm()

    this.removeMouseHandlers()
    if (typeof crtEffect.coordinateTransform === 'function') {
      this.coordinateTransform = crtEffect.coordinateTransform
      this.removeMouseHandlers = (() => {
        const handle = this.handleMouse.bind(this)

        this.canvas.addEventListener('mousedown', handle)
        this.canvas.addEventListener('mousemove', handle)
        this.canvas.addEventListener('mouseup', handle)
        this.canvas.addEventListener('click', handle)

        return () => {
          this.canvas.removeEventListener('mousedown', handle)
          this.canvas.removeEventListener('mousemove', handle)
          this.canvas.removeEventListener('mouseup', handle)
          this.canvas.removeEventListener('click', handle)
        }
      })()
    }

    this.start()
  }

  private connectXTerm() {
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

      mesh.material.map = texture
    }
  }

  private start() {
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

    const fps = 1000 / (this.options.fps ?? 60)
    const { clock, composer } = this

    let previousTime = 0
    let requestAnimationFrameId = requestAnimationFrame(function draw(time) {
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
      cancelAnimationFrame(requestAnimationFrameId)
    }
  }

  private handleMouse(ev: MouseEvent) {
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

    ;[x, y] = this.coordinateTransform?.(x, y) ?? [x, y]

    const copy: Record<string, unknown> = {}
    for (const attr in ev) {
      copy[attr] = ev[attr as keyof MouseEvent]
    }

    ;[copy.clientX, copy.clientY] = [x * width + left, bottom - y * height]

    const clonedEvent = new MouseEvent(ev.type, copy)
    ;(clonedEvent as MouseEvent & { syntethic: boolean }).syntethic = true
    this.screenElement.dispatchEvent(clonedEvent)
  }

  private dispose() {
    this.scene.children.forEach((child) => {
      if (child instanceof Mesh) {
        if (child.material instanceof MeshBasicMaterial) {
          if (child.material.map) {
            child.material.map.dispose()
          }
          child.material.dispose()
        }
        child.geometry.dispose()
      }
    })
  }
}
