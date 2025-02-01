import React, { PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'
import { RotaryKnob } from '../RotaryKnob'
import styles from './Settings.module.css'

console.log('settings module', styles)

export function Settings({
  children,
  isOpen,
  onClose,
}: PropsWithChildren<{
  isOpen: boolean
  onClose(): void
}>) {
  const settingsRoot = globalThis.document?.getElementById(
    'cool-retro-hyper-settings',
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
              <b>Settings</b>
              <RotaryKnob
                transform={(n) => +n.toFixed(2)}
                onValueChange={() => {}}
              />
            </div>
          </div>
        </div>,
        settingsRoot,
      )
    : null
}
