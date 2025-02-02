import React, { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { RotaryKnob } from '../RotaryKnob'
import logo from '../../assets/images/crh-logo.svg'
import styles from './Settings.module.css'

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

  const debug = true

  return isOpen || (debug && settingsRoot)
    ? createPortal(
      <div className={styles.layer}>
        <div className={styles.dim} onClick={onClose}>
          <div className={styles.panel} onClick={handlePreventClose}>
            <div className={styles.cornerCircle} />
            <div className={styles.cornerCircle} />
            <div className={styles.cornerCircle} />
            <div className={styles.cornerCircle} />
            <h1 className={styles.title}>
              <img src={logoDataUrl} height="32" />
              COOL RETRO HYPER
            </h1>
            <RotaryKnob
              label="Burn In"
              minAngle={0.4}
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
          </div>
        </div>
      </div>,
      settingsRoot,
    )
    : null
}
