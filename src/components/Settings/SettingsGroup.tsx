import React from 'react'
import styles from './SettingsGroup.module.css'

interface SettingsGroupProps {
  label: string
  children?: React.ReactNode
}

export function SettingsGroup({ label, children }: SettingsGroupProps) {
  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}</div>
      {children}
    </div>
  )
}
