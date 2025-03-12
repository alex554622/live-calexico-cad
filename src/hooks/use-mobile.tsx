
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
    
    // Ensure body has proper scroll settings on mobile
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      document.body.style.overflowY = "auto";
      document.body.style.WebkitOverflowScrolling = "touch";
      document.documentElement.style.overscrollBehavior = "contain";
    }
    
    // Remove event listener and reset styles on cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return isMobile
}
