import React from 'react'

export function Preferences() {
  const [isVisible, setIsVisible] = useState(false)

  return isVisible ? <div>Preferences</div> : null
}
