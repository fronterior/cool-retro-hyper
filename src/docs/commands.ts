import stringArgv from 'https://cdn.jsdelivr.net/npm/string-argv@0.3.2/+esm'
import type { CoolRetroHyperConfiguration } from 'src/types'

type CrtOptions = keyof NonNullable<CoolRetroHyperConfiguration['crt']>

const commandString = 'crt -s screenCurvature 0.5'

export function proceedCommand(
  commandString: string,
  configuration: CoolRetroHyperConfiguration,
) {
  const argv = stringArgv(commanString)

  const result: Required<CoolRetroHyperConfiguration> = {
    crt: {},
    shaderPaths: [],
    ...configuration,
  }

  const commans = {
    crt: {
      '-s'(option: string, value: string) {
        const optionValue = Number(value)
        if (!Number.isNaN(optionValue)) {
          throw new Error(`Invalid option value: ${value}`)
        }
        if (!(option in result.crt)) {
          throw new Error(`Invalid option name: ${option}`)
        }

        result.crt[option as CrtOptions] = optionValue
      },
      '-g'(option: string) {
        return result.crt[option as CrtOptions]
      },
      '-ga'() {
        return result
      },
      '-r'() {},
    },
    shaderPaths: {
      '-a'(path: string) {},
      '-d'(path: string) {},
      '-l'() {},
      '-r'() {},
    },
  }
}
