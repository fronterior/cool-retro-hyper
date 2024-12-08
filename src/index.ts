import type ReactOrigin from 'react'
import * as styles from './styles'
import React from 'react'
import { CoolRetroHyperConfiguration, HyperState, Term, Terms } from './types'
import { createCRTEffectPasses } from './createCRTEffectPasses'
import { XTermEffect } from './XTermEffect'

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

    static xTermEffect: XTermEffect

    private config: CoolRetroHyperConfiguration
    private hyper: HyperComponent

    constructor(props: HyperComponentProps, context: Record<string, unknown>) {
      super(props, context)
      this.onDecorated = this.onDecorated.bind(this)

      this.config = window.config.getConfig().coolRetroHyper ?? {}
    }

    onDecorated(terms: HyperComponent) {
      this.hyper = terms
      if (this.props.onDecorated) this.props.onDecorated(terms)
    }

    componentDidUpdate() {
      setTimeout(() => this.updateXTerms())
    }

    updateXTerms() {
      const state = window.store.getState()
      const activeRootId = state.termGroups.activeRootGroup
      if (!activeRootId) return

      const visibleTerms: Term[] = []
      for (const id of this.getVisibleTermsIdsForRootId(state, activeRootId)) {
        const termGroup = state.termGroups.termGroups[id]
        if (!termGroup) continue

        const sessionId = termGroup.sessionUid
        if (!sessionId) continue

        const term = this.hyper.terms.terms[sessionId]
        if (!term) continue

        visibleTerms.push(term)
      }

      if (!CoolRetroHyper.xTermEffect) {
        console.log('Creating CRT effect passes')
        const crtEffectPasses = createCRTEffectPasses()

        CoolRetroHyper.xTermEffect = new XTermEffect(crtEffectPasses)

        for (const { term: xTerm } of visibleTerms) {
          CoolRetroHyper.xTermEffect.attach(xTerm, false)
          CoolRetroHyper.xTermEffect.startAnimationLoop()
        }
      } else {
        for (const { term: xTerm } of visibleTerms) {
          CoolRetroHyper.xTermEffect.attach(xTerm, false)
        }
      }
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
