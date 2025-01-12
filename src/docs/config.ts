import { defaultCRTOptions } from 'src/createCRTEffect'
import { CoolRetroHyperConfiguration } from 'src/types'

type CRTOptions = keyof typeof defaultCRTOptions

const configuration: Required<CoolRetroHyperConfiguration> = {
  crt: defaultCRTOptions,
  fps: 60,
  shaderPaths: [],
}

export const config = {
  crt: {
    set(key: string, value: number | boolean) {
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
      return configuration.shaderPaths
    },
    reset() {
      configuration.shaderPaths = []
    },
  },

  getConfig() {
    return configuration
  },
}
