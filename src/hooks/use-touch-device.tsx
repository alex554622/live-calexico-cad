
import * as React from "react"

export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check if device supports touch
    const touchSupported = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    
    setIsTouchDevice(touchSupported)
    
    // Add additional class to body for touch-specific styles
    if (touchSupported) {
      document.body.classList.add('touch-device')
    }
    
    return () => {
      document.body.classList.remove('touch-device')
    }
  }, [])

  return isTouchDevice
}
