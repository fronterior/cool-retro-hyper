import { config } from './config'

// mutation, or return string
export const commands = {
  crt: {
    '-s'(option: string, value: string) {
      if (!config.crt.has(option)) {
        throw new Error(`Invalid option name: ${option}`)
      }

      const optionValue = Number(value)
      if (Number.isNaN(optionValue)) {
        throw new Error(`Invalid option value: ${value}`)
      }

      config.crt.set(option, optionValue)
    },
    '-g'(option: string) {
      if (!config.crt.has(option)) {
        throw new Error(`Invalid option name: ${option}`)
      }

      return `crt ${option} ${config.crt.get(option)}`
    },
    '-ga'() {
      return config.crt.getAll()
    },
    '-r'() {
      config.crt.reset()
    },
  },
  shaderPaths: {
    '-a'(path: string) {
      if (config.shaderPaths.has(path)) {
        throw `Shader path already exists: ${path}`
      }

      config.shaderPaths.add(path)
    },
    '-d'(path: string) {
      config.shaderPaths.delete(path)
    },
    '-l'() {
      return config.shaderPaths.getList()
    },
    '-r'() {
      config.shaderPaths.reset()
    },
  },
}
