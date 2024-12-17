import type ReactOrigin from 'react'
import * as styles from './styles'
import React from 'react'
import { HyperState, Terms } from './types'
import { createCRTEffectPasses } from './createCRTEffectPasses'
import { XTermEffect } from './XTermEffect'
import { Terminal } from 'xterm'
import { XTermConnector } from './XTermConnector'

type HyperComponentProps = {
  onDecorated(terms: HyperComponent): void
}

type HyperComponent = React.ComponentType<HyperComponentProps> & {
  terms: Terms
}

export function decorateHyper(
  Terms: HyperComponent,
  { React }: { React: typeof ReactOrigin },
) {
  // only class components are allowed
  return class CoolRetroHyper extends React.Component<HyperComponentProps> {
    static {
      console.log('Cool Retro Hyper')

      styles.init()
    }

    static defaultConfig = {
      fps: 60,
    }

    static xTermEffect: XTermEffect
    static xTermConnector = new XTermConnector()

    private hyper: HyperComponent

    constructor(props: HyperComponentProps, context: Record<string, unknown>) {
      super(props, context)
      this.onDecorated = this.onDecorated.bind(this)
    }

    onDecorated(terms: HyperComponent) {
      this.hyper = terms
      if (this.props.onDecorated) this.props.onDecorated(terms)
    }

    componentDidUpdate() {
      Promise.resolve().then(() => this.updateXTerms())
    }

    async updateXTerms() {
      const state = window.store.getState()
      const activeRootId = state.termGroups.activeRootGroup
      if (!activeRootId) return

      const visibleTerms: { id: string; term: Terminal }[] = []
      for (const id of this.getVisibleTermsIdsForRootId(state, activeRootId)) {
        const termGroup = state.termGroups.termGroups[id]
        if (!termGroup) continue

        const sessionId = termGroup.sessionUid
        if (!sessionId) continue

        const { term } = this.hyper.terms.terms[sessionId] ?? { term: null }
        if (!term) continue

        visibleTerms.push({ id, term })
      }

      const firstVisibleTerm = visibleTerms.at(0)
      if (!firstVisibleTerm) {
        return
      }

      const connectOptions = Object.assign(
        {},
        CoolRetroHyper.defaultConfig,
        window.config.getConfig()?.coolRetroHyper ?? {},
      )

      const crtEffectPasses = await createCRTEffectPasses(connectOptions)

      CoolRetroHyper.xTermConnector.connect(
        firstVisibleTerm.term,
        crtEffectPasses.passes,
        connectOptions,
      )
    }

    getVisibleTermsIdsForRootId(state: HyperState, activeRootId: string) {
      const ids = []
      const stack = [activeRootId]

      while (true) {
        const termId = stack.shift()
        if (!termId) break

        const termObject = state.termGroups.termGroups[termId]
        if (!termObject) {
          console.warn(
            `cool-retro-hyper error: term not found in termGroups "${termId}".`,
          )

          continue
        }

        if (termObject.children.length > 0 && termObject.sessionUid) {
          console.warn(
            `cool-retro-hyper error: term has children and a session "${termObject.uid}".`,
          )

          continue
        }
        if (termObject.children.length === 0 && !termObject.sessionUid) {
          console.warn(
            `cool-retro-hyper error: term has no children and no session "${termObject.uid}".`,
          )

          continue
        }

        if (termObject.children.length === 0) {
          ids.push(termId)
        } else {
          stack.push(...termObject.children)
        }
      }

      return ids
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
