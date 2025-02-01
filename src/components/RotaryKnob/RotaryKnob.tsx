import React, { useCallback, useState } from 'react'
import { Knob, UseKnobProps } from 'rotary-knob/react'
import styles from './RotaryKnob.module.css'

interface RotaryKnobProps {
  defaultValue?: number
  value?: number
  minAngle?: number
  maxAngle?: number
  startAngle?: number
  minValue?: number
  maxValue?: number
  stepValue?: number
  transform?: (value: number) => number
  onValueChange(value: number): void
}

export function RotaryKnob({
  defaultValue = 0,
  minAngle = 0,
  maxAngle = 270,
  minValue = 0,
  maxValue = 1,
  startAngle = 225,
  stepValue,
  transform = (n) => n,
  onValueChange,
}: RotaryKnobProps) {
  const [value, setValue] = useState(defaultValue)

  const handleValueChange = useCallback((value: number) => {
    const transformedValue = transform(value)
    onValueChange(transformedValue)
    setValue(transformedValue)
  }, [])

  return (
    <div>
      <input
        className={styles.numberInput}
        type="number"
        defaultValue={defaultValue}
        value={value}
        min={minValue}
        max={maxValue}
        step={stepValue}
        onChange={(ev) => handleValueChange(+ev.target.value)}
      />
      <div className={styles.container}>
        <Knob
          defaultValue={defaultValue}
          value={value}
          minAngle={minAngle}
          maxAngle={maxAngle}
          minValue={minValue}
          maxValue={maxValue}
          startAngle={startAngle}
          stepValue={stepValue}
          onValueChange={handleValueChange}
        >
          <button type="button" className={styles.knob} />
        </Knob>
      </div>
    </div>
  )
}
