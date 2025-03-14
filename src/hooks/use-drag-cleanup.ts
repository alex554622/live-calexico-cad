
import { useEffect, RefObject, MutableRefObject } from 'react';

export function useDragCleanup(
  isDraggable: MutableRefObject<boolean>,
  cardRef: RefObject<HTMLDivElement>,
  isTouchDevice: boolean
) {
  // Reset draggable state when component unmounts or when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Only run this for touch devices
      if (!isTouchDevice) return;
      
      // If we clicked outside the card and dragging is enabled, disable it
      if (cardRef.current && !cardRef.current.contains(e.target as Node) && isDraggable.current) {
        isDraggable.current = false;
        if (cardRef.current) {
          cardRef.current.classList.remove('border-primary');
          cardRef.current.classList.remove('bg-primary/10');
        }
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isTouchDevice, isDraggable, cardRef]);
}
