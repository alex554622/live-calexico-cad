
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Immediately check if mobile
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add event listener
    window.addEventListener("resize", handleResize)
    
    // Apply mobile-specific styles
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      // Set viewport meta tag to prevent zooming
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
        document.head.appendChild(meta);
      } else {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0');
      }

      // Apply mobile scrolling styles
      document.body.style.overflowY = "auto";
      // Use proper TypeScript compatible way to set webkit property
      (document.body.style as any)["-webkit-overflow-scrolling"] = "touch";
      document.documentElement.style.overscrollBehavior = "contain";
      
      // Add touch action to prevent delay
      document.body.style.touchAction = "manipulation";
      
      // Prevent text selection for better dragging experience
      document.body.style.webkitUserSelect = "none";
      document.body.style.userSelect = "none";
    }
    
    // Remove event listener and reset styles on cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return isMobile
}
