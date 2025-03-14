
import * as React from "react"

export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check if device supports touch
    const touchSupported = 'ontouchstart' in window || 
      (navigator.maxTouchPoints > 0) ||
      (navigator as any).msMaxTouchPoints > 0
    
    setIsTouchDevice(touchSupported)
    
    // Add additional class to body for touch-specific styles
    if (touchSupported) {
      document.body.classList.add('touch-device')
    }
    
    // Add a style tag for touch-specific CSS
    if (touchSupported && !document.getElementById('touch-device-styles')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'touch-device-styles';
      styleTag.innerHTML = `
        .touch-drag-target {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
          background-color: rgba(59, 130, 246, 0.1) !important;
        }
        
        #touch-drag-ghost {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          position: fixed;
          z-index: 9999;
          pointer-events: none;
          opacity: 0.9;
        }
      `;
      document.head.appendChild(styleTag);
    }
    
    return () => {
      document.body.classList.remove('touch-device')
      const styleTag = document.getElementById('touch-device-styles');
      if (styleTag) {
        document.head.removeChild(styleTag);
      }
    }
  }, [])

  return isTouchDevice
}
