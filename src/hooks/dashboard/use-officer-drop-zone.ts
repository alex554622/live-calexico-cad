
import { useState, useRef, useEffect } from 'react';
import { useTouchDevice } from '@/hooks/use-touch-device';

export function useOfficerDropZone(onOfficerDrop?: (e: React.DragEvent<HTMLDivElement>) => void) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTouchOver, setIsTouchOver] = useState(false);
  const isTouchDevice = useTouchDevice();
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Mouse drag handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    // Log to debug
    console.log('Dropping officer back to officers list');
    console.log('Data transferred:', e.dataTransfer.getData('officerId'));
    
    if (onOfficerDrop) {
      onOfficerDrop(e);
    }
  };

  // Touch event handlers for drop zone
  useEffect(() => {
    if (!isTouchDevice || !onOfficerDrop) return;
    
    const handleTouchDragMove = (e: CustomEvent) => {
      if (!sectionRef.current) return;
      
      const { x, y } = e.detail;
      const rect = sectionRef.current.getBoundingClientRect();
      
      // Check if touch position is within this section
      if (
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom
      ) {
        setIsTouchOver(true);
      } else {
        setIsTouchOver(false);
      }
    };
    
    const handleTouchDragEnd = (e: Event) => {
      setIsTouchOver(false);
      
      // If we have a touch over state and a valid officer id from touch event
      if (isTouchOver && (window as any).touchDragOfficerId) {
        const officerId = (window as any).touchDragOfficerId;
        
        console.log(`Touch drop back to list detected for officer: ${officerId}`);
        
        // Dispatch a custom event for dropping an officer back to the list
        const dropEvent = new CustomEvent('touchdroptolist', {
          detail: { officerId }
        });
        window.dispatchEvent(dropEvent);
        
        // Clear the dragged officer id
        delete (window as any).touchDragOfficerId;
      }
    };
    
    window.addEventListener('touchdragmove', handleTouchDragMove as EventListener);
    window.addEventListener('touchdragend', handleTouchDragEnd as EventListener);
    
    return () => {
      window.removeEventListener('touchdragmove', handleTouchDragMove as EventListener);
      window.removeEventListener('touchdragend', handleTouchDragEnd as EventListener);
    };
  }, [isTouchDevice, onOfficerDrop, isTouchOver]);

  return {
    isDragOver,
    isTouchOver,
    sectionRef,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}
