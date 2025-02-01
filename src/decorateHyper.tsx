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
import { Settings } from './components/Settings'
import { defaultConfiguration } from './defaultConfiguration'

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

      if (globalThis.document) {
        const ConfigurationRoot = Object.assign(
          globalThis.document.createElement('div'),
          {
            id: 'cool-retro-hyper-settings',
          },
        )
        globalThis.document.body.appendChild(ConfigurationRoot)
      }
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

      this.state = {
        isConfigOpen: false,
      }
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

      window.rpc.on('crh:open-configuration', () => {
        console.log('open configuration', this.state)
        this.setState({ isConfigOpen: true })
      })
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

      const crtEffect = createCRTEffect({
        crtOptions: window.config.getConfig()?.coolRetroHyper?.crt ?? {},
        noiseTexture: this.noiseTexture,
        userEffectPasses: this.userEffectPasses,
        glslEffects,
      })

      CoolRetroHyper.xTermConnector.connect({
        xTerm: firstVisibleTerm.term,
        crtEffect,
        fps:
          window.config.getConfig()?.coolRetroHyper?.fps ??
          defaultConfiguration.fps,
      })
    }

    getVisibleTermsIdsForRootId(state: HyperState, activeRootId: string) {
      const ids: string[] = []
      const stack: string[] = [activeRootId]

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
      return (
        <>
          <Terms {...this.props} onDecorated={this.onDecorated} />
          <Settings
            isOpen={this.state.isConfigOpen}
            onClose={() => this.setState({ isConfigOpen: false })}
          />
        </>
      )
    }
  }
}
