import React, { useCallback, useState } from 'react'
import styles from './OnOffSwitch.module.css'

interface OnOffSwitchProps {
  label: string
  defaultValue?: boolean
  value?: boolean
  onValueChange(value: boolean): void
}

export function OnOffSwitch({
  label,
  defaultValue = false,
  value,
  onValueChange,
}: OnOffSwitchProps) {
  const [integratedValue, setIntegratedValue] = useState(defaultValue)

  const handleClick = useCallback(() => {
    setIntegratedValue((boolean) => !boolean)
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.switch} onClick={handleClick}>
        ON
        <div className={styles.switchContainer}>
          <div
            className={styles.switchEmpty}
            style={{ flex: integratedValue ? 0 : 1 }}
          />
          <div className={styles.switchButton} />
        </div>
        OFF
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  )
}
