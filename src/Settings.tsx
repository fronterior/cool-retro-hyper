import React, { PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'
import './Settings.css'
import { Knob } from 'rotary-knob/react'

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
            <div>
              <Knob
                defaultValue={1}
                minAngle={0}
                maxAngle={300}
                minValue={0}
                maxValue={5}
                startAngle={210}
                stepAngle={60}
                onValueChange={console.log}
                onStatusChange={console.log}
              >
                <button type="button" className="knob" />
              </Knob>
            </div>
          </div>
        </div>,
        settingsRoot,
      )
    : null
}
