import React, { useState } from 'react'
import { createPortal } from 'react-dom'

export function Configuration({ }: {}) {
  const [config, setConfig] = useState(null)
  const [isVisible, setIsVisible] = useState(true)
  const configurationRoot = globalThis.document?.getElementById(
    'cool-retro-hyper-configuration',
  )
  // return null

  return isVisible && configurationRoot
    ? createPortal(
      <div className="cool-retro-hyper-configuration">
        <b>Configuration</b>
      </div>,
      configurationRoot,
    )
    : null
}
