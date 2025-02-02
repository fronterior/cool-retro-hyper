import React, {
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Knob } from 'rotary-knob/react'
import styles from './RotaryKnob.module.css'

interface RotaryKnobProps {
  label: string
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
  label,
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
  const inputRef = useRef<HTMLInputElement>(null)

  const validateValue = useCallback(
    (value: number) => {
      if (value < minValue) {
        return minValue
      }

      if (value > maxValue) {
        return maxValue
      }

      return Number.isNaN(value) ? defaultValue : value
    },
    [minValue, maxValue, defaultValue],
  )

  const handleInputBlur = useCallback(() => {
    if (!inputRef.current) {
      return
    }

    const newValue = validateValue(transform(+inputRef.current.value))
    onValueChange(newValue)
    setValue(newValue)

    // case: defaultValue === newValue
    inputRef.current.value = newValue.toString()
  }, [validateValue, onValueChange])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value.toString()
    }
  }, [value])

  const handleValueChange = useCallback((value: number) => {
    const transformedValue = transform(value)

    onValueChange(transformedValue)
    setValue(transformedValue)
  }, [])

  const handleStatusChange = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }, [])

  const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> =
    useCallback(
      (ev) => {
        if (ev.key === 'Enter' || ev.key === 'Escape') {
          ev.stopPropagation()
          handleStatusChange()
        }
      },
      [handleStatusChange],
    )

  const steplines = useMemo(() => {
    if (!stepValue) {
      return []
    }

    const stepAngle =
      (stepValue / (maxValue - minValue)) * (maxAngle - minAngle)

    return Array.from(
      {
        length: Math.ceil((maxValue - minValue) / stepValue) - 1,
      },
      (_, i) => (
        <div
          className={styles.stepline}
          style={{
            transform: `rotate(${minAngle + startAngle + stepAngle * (i + 1)}deg)`,
          }}
          key={`stepline-${i}`}
        />
      ),
    )
  }, [stepValue])

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        className={styles.numberInput}
        type="number"
        defaultValue={defaultValue}
        min={minValue}
        max={maxValue}
        step={stepValue}
        onKeyDown={handleInputKeyDown}
        onBlur={handleInputBlur}
      />
      <div className={styles.knobContainer}>
        <div
          className={styles.baseline}
          style={{ transform: `rotate(${minAngle + startAngle}deg)` }}
        />
        <div
          className={styles.baseline}
          style={{ transform: `rotate(${maxAngle + startAngle}deg)` }}
        />
        {steplines}
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
          onStatusChange={handleStatusChange}
        >
          <button type="button" className={styles.knob} />
        </Knob>
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  )
}
