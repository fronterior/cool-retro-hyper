import React, { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { RotaryKnob } from '../RotaryKnob'
import logo from '../../assets/images/crh-logo.svg'
import styles from './Settings.module.css'
import { SettingsGroup } from './SettingsGroup'
import { SettingsPanel } from './SettingsPanel'
import { OnOffSwitch } from '../OnOffSwitch/OnOffSwitch'

export function Settings({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose(): void
}) {
  const settingsRoot = globalThis.document?.getElementById(
    'cool-retro-hyper-settings',
  )

  const logoDataUrl = useMemo(
    () =>
      `data:image/svg+xml, ${encodeURIComponent(logo.replaceAll('\n', ''))}`,
    [],
  )

  const handlePreventClose = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  const debug = false

  return isOpen || (debug && settingsRoot)
    ? createPortal(
      <div className={styles.layer}>
        <div className={styles.dim} onClick={onClose}>
          <SettingsPanel onClick={handlePreventClose}>
            <h1 className={styles.title}>
              <img src={logoDataUrl} height="32" />
              COOL RETRO HYPER
            </h1>

            <div className={styles.flexRow}>
              <SettingsGroup label="Screen Effects">
                <div>
                  <RotaryKnob
                    label="Burn In"
                    defaultValue={0.4}
                    minAngle={0}
                    maxAngle={270}
                    minValue={0}
                    maxValue={1}
                    startAngle={225}
                    transform={(n) => +n.toFixed(2)}
                    onValueChange={() => { }}
                  />
                  <RotaryKnob
                    label="Jitter"
                    defaultValue={0.8}
                    minAngle={0}
                    maxAngle={270}
                    minValue={0}
                    maxValue={2}
                    startAngle={225}
                    transform={(n) => +n.toFixed(2)}
                    onValueChange={() => { }}
                  />
                  <RotaryKnob
                    label="Static Noise"
                    defaultValue={0.4}
                    minAngle={0}
                    maxAngle={270}
                    minValue={0}
                    maxValue={1}
                    startAngle={225}
                    transform={(n) => +n.toFixed(2)}
                    onValueChange={() => { }}
                  />
                </div>
                <div className={styles.topAlignment}>
                  <OnOffSwitch
                    label="Pixelization"
                    onValueChange={() => { }}
                  />
                  <RotaryKnob
                    label="Pixel Height"
                    defaultValue={6}
                    minAngle={0}
                    maxAngle={300}
                    minValue={0}
                    maxValue={20}
                    startAngle={210}
                    stepValue={1}
                    transform={(n) => Math.round(n)}
                    onValueChange={() => { }}
                  />
                </div>
                <div>
                  <RotaryKnob
                    label="RGB Shift"
                    defaultValue={0.25}
                    minAngle={0}
                    maxAngle={270}
                    minValue={0}
                    maxValue={1}
                    startAngle={225}
                    transform={(n) => +n.toFixed(2)}
                    onValueChange={() => { }}
                  />
                  <RotaryKnob
                    label="Distances"
                    defaultValue={0.13}
                    minAngle={0}
                    maxAngle={270}
                    minValue={0}
                    maxValue={1}
                    startAngle={225}
                    transform={(n) => +n.toFixed(2)}
                    onValueChange={() => { }}
                  />
                </div>
              </SettingsGroup>
              <div className={styles.flexColumn}>
                <SettingsGroup label="Lighting Effects">
                  <RotaryKnob
                    label="Ambient Light"
                    defaultValue={0.5}
                    minAngle={0}
                    maxAngle={270}
                    minValue={0}
                    maxValue={1}
                    startAngle={225}
                    transform={(n) => +n.toFixed(2)}
                    onValueChange={() => { }}
                  />
                  <RotaryKnob
                    label="Bloom"
                    defaultValue={3}
                    minAngle={0}
                    maxAngle={300}
                    minValue={0}
                    maxValue={5}
                    startAngle={210}
                    stepValue={1}
                    transform={(n) => Math.round(n)}
                    onValueChange={() => { }}
                  />
                  <RotaryKnob
                    label="Flickering"
                    defaultValue={0.2}
                    minAngle={0}
                    maxAngle={270}
                    minValue={0}
                    maxValue={1}
                    startAngle={225}
                    transform={(n) => +n.toFixed(2)}
                    onValueChange={() => { }}
                  />
                  <RotaryKnob
                    label="Growing Line"
                    defaultValue={0.75}
                    minAngle={0}
                    maxAngle={270}
                    minValue={0}
                    maxValue={2}
                    startAngle={225}
                    transform={(n) => +n.toFixed(2)}
                    onValueChange={() => { }}
                  />
                </SettingsGroup>

                <SettingsGroup label="Appearance">
                  <RotaryKnob
                    label="Screen Curvature"
                    defaultValue={0.1}
                    minAngle={0}
                    maxAngle={300}
                    minValue={0}
                    maxValue={0.5}
                    startAngle={225}
                    transform={(n) => +n.toFixed(2)}
                    onValueChange={() => { }}
                  />
                  <RotaryKnob
                    label="Bazel Size"
                    defaultValue={0.12}
                    minAngle={0}
                    maxAngle={300}
                    minValue={0}
                    maxValue={1}
                    startAngle={210}
                    transform={(n) => +n.toFixed(2)}
                    onValueChange={() => { }}
                  />
                </SettingsGroup>
              </div>
            </div>
          </SettingsPanel>
        </div>
      </div>,
      settingsRoot,
    )
    : null
}
