import { Terminal } from 'https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/+esm'
import { WebglAddon } from 'https://cdn.jsdelivr.net/npm/@xterm/addon-webgl@0.18.0/+esm'
import { FitAddon } from 'https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0.10.0/+esm'
import { WebLinksAddon } from 'https://cdn.jsdelivr.net/npm/@xterm/addon-web-links@0.11.0/+esm'
import stringArgv from 'https://cdn.jsdelivr.net/npm/string-argv@0.3.2/+esm'
import { createCRTEffect } from '../createCRTEffect'
import * as glslEffects from '../glsl'
import * as THREE from 'three'
import { XTermConnector } from '../XTermConnector'
import { commands } from './commands'
import packageJSON from '../../package.json'
import type { CoolRetroHyperConfiguration } from '../types'
import { config } from './config'
import { Effect, EffectPass, BlendFunction } from 'postprocessing'

const version = packageJSON.version

const noiseTexture = await new Promise<THREE.Texture>((res) => {
  new THREE.TextureLoader().load('./allNoise512.png', (texture) => {
    texture.minFilter = THREE.LinearFilter
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    res(texture)
  })
})

config.crt.set('screenCurvature', 0.3)
config.shaderPaths.add(
  'https://raw.githubusercontent.com/fronterior/cool-retro-hyper/refs/heads/main/examples/neonwave-sunrise.glsl',
)
const configuration: CoolRetroHyperConfiguration = config.getConfig()

const term = new Terminal()
const webglAddon = new WebglAddon()
const fitAddon = new FitAddon()
const webLinksAddon = new WebLinksAddon()

const hostname = 'cool-retro-hyper'
// [~m is zero size...
const hyperPromptText = `\x1B[1;38;2;255;255;255m${hostname}\x1B[0m \x1B[1;33m$\x1B[0m `
const hyperPromptTextLength = hyperPromptText.replaceAll(/\x1B.*?m/g, '').length

const HyperASCIILogo = `
   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  
 ▒▒▒░                      ░▒▒▒
▒▒▒      \x1B[38;2;255;255;184m▓\x1B[0m                   ▒▒▒
▒▒     \x1B[38;2;255;255;184m▒█░\x1B[0m                    ▒▒
▒▒   \x1B[38;2;255;255;184m▒███\x1B[0m                     ▒▒
▒▒     \x1B[38;2;255;255;184m▒██▒\x1B[0m                   ▒▒
▒▒     \x1B[38;2;255;255;184m██\x1B[0m                     ▒▒
▒▒    \x1B[38;2;255;255;184m▒█     █████\x1B[0m            ▒▒
▒▒                            ▒▒
▒▒                            ▒▒
▒▒                            ▒▒
▒▒                            ▒▒
▒▒                            ▒▒
▒▒▒                          ▒▒▒
 ▒▒▒░                      ░▒▒▒
   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
`.split('\n')

const HyperInfo = `
\x1B[1;38;2;0;255;0mWelcome to Cool Retro Hyper Example\x1B[0m
------------------------------------
\x1B[1;33mVersion\x1B[0m: ${version}
\x1B[1;33mRepositiry\x1B[0m: \x1B[38;2;0;255;255mhttps://github.com/fronterior/cool-retro-hyper\x1B[0m 

\x1B[1;33mUsage\x1B[0m: crt [command]
  -s <option> <value>         Set configuration
  -g <option>                 Get configuration
  -ga                         Get all configuration
  -r                          Reset configuration

\x1B[1;33mUsage\x1B[0m: shaderPaths [command]
  -a <path>                   Add shader GLSL URL
  -d <path>                   Delete shader GLSL URL
  -l                          List shader GLSL URLs
  -r                          Reset configuration

\x1B[1;33mExamples\x1B[0m:
  crt -s screenCurvature 0.2
  shaderPaths add <SHADER_TEXT_URL>
`.split('\n')

term.open(document.getElementById('terminal')!)
term.loadAddon(webglAddon)
term.loadAddon(fitAddon)
term.loadAddon(webLinksAddon)

function getRawText(text: string) {
  return text.replaceAll(/\x1B.*?m/g, '')
}

function crhFetch() {
  const paddingLeft = 3
  const lineWidth = 35

  const maxLineWidth =
    paddingLeft +
    lineWidth +
    Math.max(...HyperInfo.map((line) => getRawText(line).length))

  if (term.cols > maxLineWidth) {
    const maxLineHeight = Math.max(HyperASCIILogo.length, HyperInfo.length)
    for (let i = 0; i < maxLineHeight; i++) {
      const logoLine = HyperASCIILogo[i] ?? ''
      const textWidth = logoLine.replaceAll(/\x1B.*?m/g, '').length
      const line =
        ' '.repeat(paddingLeft) +
        logoLine.padEnd(lineWidth + logoLine.length - textWidth, ' ') +
        HyperInfo[i]
      term.write(`${line}\n\r`)
    }
  } else {
    const logoPaddingLeft = Math.floor((term.cols - 32) / 2)
    for (const line of 32 > term.cols ? [] : HyperASCIILogo) {
      term.write(`${' '.repeat(logoPaddingLeft)}${line}\n\r`)
    }
    for (const line of HyperInfo) {
      term.write(`${line}\n\r`)
    }
  }
}

function prompt() {
  term.write(hyperPromptText)
}

function run(cmd: string) {
  if (cmd.length === 0) {
    return
  }
  const [name, flag, ...values] = stringArgv(cmd)
  if (!(name! in commands)) {
    term.write(`\n\rcrh: command not found: ${name}`)
    return
  }

  const flags = commands[name as keyof typeof commands]
  if (!(flag in flags)) {
    term.write(`\n\r${name}: flag not found: ${flag}`)
    return
  }

  const func = flags[flag as keyof typeof flags]

  const output = (() => {
    try {
      return func(...values)
    } catch (error: Error) {
      return error.message
    }
  })()

  if (output) {
    for (const line of output.split('\n')) {
      term.write(`\n\r${line.trimRight()}`)
    }

    return
  }

  const configuration = config.getConfig()

  Promise.allSettled(
    config.getConfig().shaderPaths.map((url) => fetchUserShader(url)),
  ).then((userEffectPasses) => {
    const crtEffect = createCRTEffect({
      crtOptions: configuration.crt,
      noiseTexture,
      glslEffects,
      userEffectPasses: userEffectPasses
        .filter(({ status }) => status === 'fulfilled')
        .map(({ value }) => value),
    })
    xTermConnector.connect({ xTerm: term, crtEffect, fps: connectOptions.fps })
  })
}

const inputHistory: string[] = []
let historyCursor = 0

let inputText = ''
let cursor = 0
term.onKey(({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
  const keyCode = key.charCodeAt(0)
  const { cursorX, cursorY } = term.buffer.active

  switch (keyCode) {
    case 13: // Enter
      const cmd = inputText.trim()
      inputHistory.push(cmd)
      historyCursor = inputHistory.length

      run(cmd)

      term.write('\n')
      term.write(key)
      prompt()
      inputText = ''
      cursor = 0
      return
    case 27: // Arrow Keys
      const eventKey = domEvent.key
      if (eventKey === 'ArrowUp') {
        if (!historyCursor) {
          return
        }

        historyCursor -= 1
        const nextText = inputHistory[historyCursor]!
        inputText = nextText
        cursor = nextText.length

        term.write(
          `\r${hyperPromptText}${nextText}${' '.repeat(term.cols - hyperPromptText.length - nextText.length)}\x1b[${cursorY + 2};${hyperPromptTextLength + cursor + 1}H`,
        )
      }
      if (eventKey === 'ArrowDown') {
        if (historyCursor >= inputHistory.length - 1) {
          if (historyCursor < inputHistory.length) {
            inputText = ''
            cursor = 0
            term.write(
              `\r${hyperPromptText}${' '.repeat(term.cols - hyperPromptText.length)}\x1b[${cursorY + 1};${hyperPromptTextLength + 1}H`,
            )
          }
          return
        }

        historyCursor += 1
        const nextText = inputHistory[historyCursor]!
        inputText = nextText
        cursor = nextText.length

        term.write(
          `\r${hyperPromptText}${nextText}${' '.repeat(term.cols - hyperPromptText.length - nextText.length)}\x1b[${cursorY + 1};${hyperPromptTextLength + cursor + 1}H`,
        )
        return
      }
      if (eventKey === 'ArrowLeft' && !cursor) {
        return
      }
      if (eventKey === 'ArrowRight' && cursor === inputText.length) {
        return
      }

      term.write(key)
      cursor +=
        eventKey === 'ArrowLeft' ? -1 : eventKey === 'ArrowRight' ? 1 : 0
      return
    case 127: // Backspace
      if (!cursor) {
        return
      }

      term.buffer.active.getLine(cursorY)?.translateToString() ?? ''
      const promptText = inputText
      const nextText =
        promptText.slice(0, cursor - 1) + promptText.slice(cursor)

      term.write(
        `\r${hyperPromptText}${nextText} \x1b[${cursorY + 1};${cursorX}H`,
      )

      inputText = nextText
      cursor -= 1
      return
    default:
      const writeText =
        inputText.slice(0, cursor) + domEvent.key + inputText.slice(cursor)
      term.write(
        `\r${hyperPromptText}${writeText}\x1b[${cursorY + 1};${cursorX + 2}H`,
      )
      inputText = writeText
      cursor += 1
  }
})

function debounce(cb: () => void, delay: number) {
  let timer = -1
  return () => {
    clearTimeout(timer)
    timer = setTimeout(cb, delay)
  }
}

window.addEventListener(
  'resize',
  debounce(() => {
    fitAddon.fit()
    term.reset()
    crhFetch()
    prompt()
  }, 32),
)
fitAddon.fit()
crhFetch()
prompt()

function transformShaderToy(glsl: string) {
  return (
    glsl
      .replaceAll('iTime', 'time')
      .replaceAll('iResolution', 'resolution')
      .replace('mainImage', 'coolRetroHyperShadertoyMainImage') +
    `\nvoid mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 fragColor) { vec2 fragCoord = uv * resolution.xy; coolRetroHyperShadertoyMainImage(fragColor, fragCoord); }`
  )
}

function fetchUserShader(url: string) {
  return fetch(url)
    .then((res) => res.text())
    .then((value) => {
      let code = value.toString().replaceAll(/^.*#define PI .*$/gm, '')

      if (code.includes('@shadertoy')) {
        code = transformShaderToy(code)
      }

      return new EffectPass(
        undefined,
        new Effect(url, code, {
          blendFunction: BlendFunction.SCREEN,
        }),
      )
    })
}

const crtEffect = createCRTEffect({
  crtOptions: configuration.crt ?? {},
  noiseTexture,
  glslEffects,
  userEffectPasses: [],
})

const connectOptions = {
  fps: 60,
  shaderPaths: configuration.shaderPaths,
}

const xTermConnector = new XTermConnector()
xTermConnector.connect({ xTerm: term, crtEffect, fps: connectOptions.fps })

Promise.allSettled(
  config.getConfig().shaderPaths.map((url) => fetchUserShader(url)),
).then((userEffectPasses) => {
  const crtEffect = createCRTEffect({
    crtOptions: configuration.crt ?? {},
    noiseTexture,
    glslEffects,
    userEffectPasses: userEffectPasses
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value),
  })
  xTermConnector.connect({ xTerm: term, crtEffect, fps: connectOptions.fps })
})
