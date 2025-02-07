import React from 'react'
import styles from './SettingsPanel.module.css'

export function SettingsPanel({
  children,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div className={styles.container} {...props}>
      <div className={styles.cornerCircle} />
      <div className={styles.cornerCircle} />
      <div className={styles.cornerCircle} />
      <div className={styles.cornerCircle} />
      {children}
    </div>
  )
}
