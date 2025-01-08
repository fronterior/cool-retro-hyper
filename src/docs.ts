import { Terminal } from 'https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/+esm'
import { WebglAddon } from 'https://cdn.jsdelivr.net/npm/@xterm/addon-webgl@0.18.0/+esm'
import { FitAddon } from 'https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0.10.0/+esm'
import { WebLinksAddon } from 'https://cdn.jsdelivr.net/npm/@xterm/addon-web-links@0.11.0/+esm'
import { createCRTEffect } from './createCRTEffect'
import * as glslEffects from './glsl'
import * as THREE from 'three'
import { XTermConnector } from './XTermConnector'
import packageJSON from '../package.json'
import { CoolRetroHyperConfiguration } from './types'

const version = packageJSON.version

const noiseTexture = await new Promise<THREE.Texture>((res) => {
  new THREE.TextureLoader().load('./allNoise512.png', (texture) => {
    texture.minFilter = THREE.LinearFilter
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    res(texture)
  })
})

const configuration: CoolRetroHyperConfiguration = {
  crt: {
    screenCurvature: 0.3,
  },
  shaderPaths: [],
}

const term = new Terminal()
const webglAddon = new WebglAddon()
const fitAddon = new FitAddon()
const webLinksAddon = new WebLinksAddon()

const hostname = 'cool-retro-hyper'
// [~m is zero size...
const hyperPromptText = `\x1B[1;38;2;255;255;255m${hostname}\x1B[0m \x1B[1;33m$\x1B[0m `

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

\x1B[1;33mUsage\x1B[0m: crh [command]
  -h, --help                   Show this message
  -c, --config                 Get all configuration
  -c, --config <key>           Get configuration
  -c, --config <key> <value>   Set configuration
  -r, --reset                  Reset configuration

\x1B[1;33mExamples\x1B[0m:
  crh --config crt.screenCurvature 0.2
  crh -c shaderPaths <SHADER_TEXT_URL>
  crh -r
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
      const logoLine = HyperASCIILogo[i]
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
  const [name, flag, ...args] = cmd.split(' ')

  if (name !== 'crh') {
    term.write(`\n\rcommand not found: ${name}`)
    return
  }

  if (flag === '-c' || flag === '--config') {
    const [key, ...values] = args

    let targetObject = configuration
    key?.split('.').forEach((field, i, { length }) => {
      if (i + 1 === length) {
        const value = +values[0]
        if (!Number.isNaN(value)) {
          targetObject[field] = value
        }

        return
      }

      targetObject = targetObject[field]
    })

    console.log(configuration)

    const crtEffect = createCRTEffect({
      options: configuration,
      noiseTexture,
      glslEffects,
      userEffectPasses: [],
    })

    xTermConnector.connect(term, crtEffect, connectOptions)
  }

  term.write('\n\r ⚠️ Working in progress ⚠️')
}

const inputHistory = []

let inputText = ''
let cursor = 0
term.onKey(({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
  const keyCode = key.charCodeAt(0)
  const { cursorX, cursorY } = term.buffer.active

  switch (keyCode) {
    case 13: // Enter
      const cmd = inputText.trim()
      inputHistory.push(cmd)
      run(cmd)

      term.write('\n')
      term.write(key)
      prompt()
      inputText = ''
      cursor = 0
      return
    case 27: // Arrow Keys
      const eventKey = domEvent.key
      if (eventKey === 'ArrowUp' || eventKey === 'ArrowDown') {
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

const crtEffect = createCRTEffect({
  options: configuration,
  noiseTexture,
  glslEffects,
  userEffectPasses: [],
})

const connectOptions = {
  fps: 60,
  shaderPaths: configuration.shaderPaths,
}

const xTermConnector = new XTermConnector()
xTermConnector.connect(term, crtEffect, connectOptions)
