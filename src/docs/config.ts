import { defaultCRTOptions } from 'src/createCRTEffect'
import { CoolRetroHyperConfiguration } from 'src/types'

const configuration: Required<CoolRetroHyperConfiguration> = {
  crt: defaultCRTOptions,
  fps: 60,
  shaderPaths: [],
}

export const config = {
  crt: {
    set(key: string, value: number | boolean | string) {
      configuration.crt[key] = value
    },
    has(key: string) {
      return key in configuration.crt
    },
    get(key: string) {
      return configuration.crt[key]
    },
    getAll() {
      return JSON.stringify(configuration.crt, null, 2)
    },
    reset() {
      configuration.crt = defaultCRTOptions
    },
  },
  shaderPaths: {
    has(path: string) {
      return configuration.shaderPaths.includes(path)
    },
    add(path: string) {
      configuration.shaderPaths.push(path)
    },
    delete(path: string) {
      configuration.shaderPaths = configuration.shaderPaths.filter(
        (p) => p !== path,
      )
    },
    getList() {
      return configuration.shaderPaths.join('\n')
    },
    reset() {
      configuration.shaderPaths = []
    },
  },

  getConfig() {
    return configuration
  },
}
