import React from 'react'
import styles from './Button.module.css'

interface ButtonProps {
  children: React.ReactNode
}

export const Button = ({ children }: ButtonProps) => {
  return <button className={styles.container}>{children}</button>
}
