import React, { PropsWithChildren, useState } from 'react'
import { createPortal } from 'react-dom'
import './Configuration.css'

export function Configuration({
  children,
  isOpen,
  onClose,
}: PropsWithChildren<{
  isOpen: boolean
  onClose(): void
}>) {
  const configurationRoot = globalThis.document?.getElementById(
    'cool-retro-hyper-configuration',
  )

  const handlePreventClose = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  return isOpen && configurationRoot
    ? createPortal(
        <div className="cool-retro-hyper-configuration-dim" onClick={onClose}>
          <div
            className="cool-retro-hyper-configuration"
            onClick={handlePreventClose}
          >
            <b>Configuration</b>
            <div>{children}</div>
          </div>
        </div>,
        configurationRoot,
      )
    : null
}
