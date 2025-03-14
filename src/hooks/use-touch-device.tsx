
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
      
      // On iOS and Safari, we often need to disable some default behaviors
      document.addEventListener('touchmove', function(e) {
        // Check if this is a drag operation
        if ((window as any).touchDragOfficerId) {
          e.preventDefault();
        }
      }, { passive: false });
      
      // Prevent rubber-banding/bouncing effect on iOS
      document.body.style.overscrollBehavior = 'none';
      
      // Add a meta tag to prevent zooming during double-tap
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }
    
    return () => {
      document.body.classList.remove('touch-device')
      
      // Cleanup touch event listeners
      if (touchSupported) {
        document.removeEventListener('touchmove', function(e) {
          if ((window as any).touchDragOfficerId) {
            e.preventDefault();
          }
        });
      }
    }
  }, [])

  return isTouchDevice
}
