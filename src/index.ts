import type ReactOrigin from 'react'
import * as styles from './styles'
import React from 'react'
import { HyperState, Terms } from './types'
import { createCRTEffect } from './createCRTEffect'
import { Terminal } from 'xterm'
import { XTermConnector } from './XTermConnector'
import { loadUserShaders, noiseTexturePromise } from './utils'
import { EffectPass } from 'postprocessing'
import * as glslEffects from './glsl'

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

    static xTermConnector = new XTermConnector()
    static noiseTexturePromise = noiseTexturePromise
    static userEffectPassesPromise: Promise<EffectPass[]>

    private hyper: HyperComponent

    private noiseTexture!: Awaited<typeof CoolRetroHyper.noiseTexturePromise>
    private userEffectPasses: EffectPass[] = []

    constructor(props: HyperComponentProps, context: Record<string, unknown>) {
      super(props, context)
      this.onDecorated = this.onDecorated.bind(this)

      CoolRetroHyper.noiseTexturePromise.then(
        (texture) => (this.noiseTexture = texture),
      )
      CoolRetroHyper.userEffectPassesPromise = (
        CoolRetroHyper.userEffectPassesPromise ??
        loadUserShaders(
          window.config.getConfig()?.coolRetroHyper?.shaderPaths ?? [],
        )
      ).then((userEffectPasses) => (this.userEffectPasses = userEffectPasses))
    }

    onDecorated(terms: HyperComponent) {
      this.hyper = terms
      if (this.props.onDecorated) this.props.onDecorated(terms)
    }

    componentDidUpdate() {
      Promise.resolve()
        .then(() =>
          Promise.all([
            CoolRetroHyper.noiseTexturePromise,
            CoolRetroHyper.userEffectPassesPromise,
          ]),
        )
        .then(() => this.updateXTerms())
    }

    updateXTerms() {
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

      const options = Object.assign({}, CoolRetroHyper.defaultConfig)

      const crtEffect = createCRTEffect({
        crtOptions: window.config.getConfig()?.coolRetroHyper?.crt ?? {},
        noiseTexture: this.noiseTexture,
        userEffectPasses: this.userEffectPasses,
        glslEffects,
      })

      CoolRetroHyper.xTermConnector.connect({
        xTerm: firstVisibleTerm.term,
        crtEffect,
        fps: options.fps,
      })
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
