import type ReactOrigin from 'react'
import * as styles from './styles'
import React from 'react'

type HyperComponentProps = {
  onDecorated(terms: React.ReactNode): void
}

type HyperComponent = React.ComponentType<HyperComponentProps>

type CoolRetroHyperConfiguration = {
  test?: string
}

export function decorateHyper(
  Terms: HyperComponent,
  { React }: { React: typeof ReactOrigin },
) {
  // only class components are allowed
  return class extends React.Component<HyperComponentProps> {
    static {
      console.log('Cool Retro Hyper')

      styles.init()
    }

    config: CoolRetroHyperConfiguration
    terms: React.ReactNode

    constructor(props: HyperComponentProps, context: Record<string, unknown>) {
      super(props, context)
      this.terms = null
      this.onDecorated = this.onDecorated.bind(this)

      this.config = window.config.getConfig().coolRetroHyper
    }

    onDecorated(terms: React.ReactNode) {
      this.terms = terms
      // Don't forget to propagate it to HOC chain
      if (this.props.onDecorated) this.props.onDecorated(terms)
    }

    render() {
      return React.createElement(
        Terms,
        Object.assign({}, this.props, {
          onDecorated: this.onDecorated,
        }),
      )
    }
  }
}
