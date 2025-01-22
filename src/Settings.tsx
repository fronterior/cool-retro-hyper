import React, { PropsWithChildren, useState } from 'react'
import { createPortal } from 'react-dom'
import './Settings.css'

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

  return isOpen && settingsRoot
    ? createPortal(
        <div className="cool-retro-hyper-settings-dim" onClick={onClose}>
          <div
            className="cool-retro-hyper-settings"
            onClick={handlePreventClose}
          >
            <b>Settings</b>
            <div>{children}</div>
          </div>
        </div>,
        settingsRoot,
      )
    : null
}
