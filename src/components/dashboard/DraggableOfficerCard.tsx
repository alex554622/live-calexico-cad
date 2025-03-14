
import React, { useState, useRef, useEffect } from 'react';
import { Officer } from '@/types';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';
import { useTouchDevice } from '@/hooks/use-touch-device';

interface DraggableOfficerCardProps {
  officer: Officer;
  onClick: () => void;
}

const DraggableOfficerCard: React.FC<DraggableOfficerCardProps> = ({ 
  officer, 
  onClick 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [touchDragging, setTouchDragging] = useState(false);
  const isTouchDevice = useTouchDevice();
  const touchTimer = useRef<number | null>(null);
  const initialTouchPosition = useRef({ x: 0, y: 0 });
  const touchMovePosition = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const lastTapTime = useRef<number>(0);
  const isDraggable = useRef<boolean>(false);

  // Handle mouse drag events
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("officerId", officer.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
    
    // Add ghost dragging image for better visual feedback
    const dragImg = document.createElement('div');
    dragImg.className = 'invisible';
    document.body.appendChild(dragImg);
    
    // Create a dragging element for visual feedback
    const dragElement = document.createElement('div');
    dragElement.className = 'fixed z-50 pointer-events-none bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 opacity-90';
    dragElement.innerHTML = `<div>${officer.name}</div>`;
    dragElement.id = 'drag-ghost';
    document.body.appendChild(dragElement);
    ghostRef.current = dragElement;
    
    // Update ghost position during drag
    const updateGhostPosition = (e: MouseEvent) => {
      const ghost = document.getElementById('drag-ghost');
      if (ghost) {
        ghost.style.left = `${e.clientX + 10}px`;
        ghost.style.top = `${e.clientY + 10}px`;
      }
    };
    
    document.addEventListener('mousemove', updateGhostPosition);
    
    e.dataTransfer.setDragImage(dragImg, 0, 0);
    
    // Cleanup when drag ends
    const cleanup = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', updateGhostPosition);
      document.body.removeChild(dragImg);
      if (ghostRef.current) document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    };
    
    document.addEventListener('dragend', cleanup, { once: true });
  };

  // Check for double tap
  const checkDoubleTap = (): boolean => {
    const now = Date.now();
    const timeSince = now - lastTapTime.current;
    
    if (timeSince < 300) {
      // Double tap detected
      return true;
    }
    
    // Update last tap time
    lastTapTime.current = now;
    return false;
  };

  // Touch event handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    initialTouchPosition.current = { x: touch.clientX, y: touch.clientY };
    
    // Check for double tap to activate dragging mode
    const isDoubleTap = checkDoubleTap();
    
    if (isDoubleTap) {
      isDraggable.current = true;
      
      // Visual indication that dragging is enabled
      if (cardRef.current) {
        cardRef.current.classList.add('border-primary');
        cardRef.current.classList.add('bg-primary/10');
      }
      
      // Show toast or visual feedback that dragging is enabled
      const dragIndicator = document.createElement('div');
      dragIndicator.className = 'fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black text-white text-sm px-4 py-2 rounded-full opacity-80 pointer-events-none';
      dragIndicator.innerHTML = 'Drag mode activated';
      dragIndicator.id = 'drag-indicator';
      document.body.appendChild(dragIndicator);
      
      // Remove the indicator after 1.5 seconds
      setTimeout(() => {
        if (document.getElementById('drag-indicator')) {
          document.body.removeChild(document.getElementById('drag-indicator')!);
        }
      }, 1500);
      
      return;
    }
    
    // Only start dragging if we've double-tapped
    if (!isDraggable.current) {
      // If not in drag mode, the touchend will trigger onClick
      return;
    }
    
    // Use a timer to distinguish between tap and drag
    touchTimer.current = window.setTimeout(() => {
      setTouchDragging(true);
      
      // Store officer ID in a global variable that our drop zones can access
      (window as any).touchDragOfficerId = officer.id;
      
      // Create ghost element
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        const ghost = document.createElement('div');
        ghost.className = 'fixed z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 opacity-90';
        ghost.innerHTML = `<div>${officer.name}</div>`;
        ghost.id = 'touch-drag-ghost';
        ghost.style.position = 'fixed';
        ghost.style.left = `${touch.clientX - 30}px`;
        ghost.style.top = `${touch.clientY - 30}px`;
        ghost.style.width = '120px';
        ghost.style.pointerEvents = 'none';
        document.body.appendChild(ghost);
        ghostRef.current = ghost;
      }
      
      // Add visual indication that we're dragging
      if (cardRef.current) {
        cardRef.current.style.opacity = '0.5';
      }
      
      // Dispatch custom event to notify the app that a touch drag has started
      window.dispatchEvent(new CustomEvent('touchdragstart', { 
        detail: { officerId: officer.id }
      }));
    }, 100); // Reduced from 300ms to 100ms for more responsive drag start
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    // If we're not in draggable mode or not currently dragging, exit
    if (!isDraggable.current) return;
    
    const touch = e.touches[0];
    touchMovePosition.current = { x: touch.clientX, y: touch.clientY };
    
    // If we're in drag mode, update the ghost element position
    if (touchDragging && ghostRef.current) {
      ghostRef.current.style.left = `${touch.clientX - 30}px`;
      ghostRef.current.style.top = `${touch.clientY - 30}px`;
      
      // Emit touch move event with position for drop targets
      window.dispatchEvent(new CustomEvent('touchdragmove', { 
        detail: { 
          officerId: officer.id,
          x: touch.clientX,
          y: touch.clientY
        }
      }));
      
      // Prevent scrolling while dragging
      e.preventDefault();
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear the timer if touch ended before timer fired
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
    
    // If we were dragging, handle the drop
    if (touchDragging) {
      const touch = e.changedTouches[0];
      
      // Find element under the touch point (potential drop target)
      const dropElement = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropZone = dropElement?.closest('[data-assignment-id]');
      
      if (dropZone) {
        const assignmentId = dropZone.getAttribute('data-assignment-id');
        if (assignmentId) {
          // Dispatch custom drop event
          window.dispatchEvent(new CustomEvent('touchdrop', { 
            detail: { 
              officerId: officer.id,
              assignmentId: assignmentId,
              x: touch.clientX,
              y: touch.clientY
            }
          }));
        }
      }
      
      // Clean up
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current);
        ghostRef.current = null;
      }
      
      // Reset styles
      if (cardRef.current) {
        cardRef.current.style.opacity = '1';
      }
      
      setTouchDragging(false);
      delete (window as any).touchDragOfficerId;
      
      // Notify app that touch drag has ended
      window.dispatchEvent(new CustomEvent('touchdragend'));
      
      // Reset draggable mode after a drop
      isDraggable.current = false;
      if (cardRef.current) {
        cardRef.current.classList.remove('border-primary');
        cardRef.current.classList.remove('bg-primary/10');
      }
    } else if (!isDraggable.current) {
      // If not dragging and not in draggable mode, it was a normal tap
      onClick();
    }
  };

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
  }, [isTouchDevice]);

  return (
    <div 
      ref={cardRef}
      className={`border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors flex items-center justify-between 
        ${officer.currentIncidentId ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/40' : ''}
        ${isDragging || touchDragging ? 'opacity-50' : ''}
        ${isTouchDevice ? 'touch-action-pan-y active:opacity-70' : ''}`}
      onClick={isTouchDevice ? undefined : onClick}
      draggable={!isTouchDevice}
      onDragStart={!isTouchDevice ? handleDragStart : undefined}
      onTouchStart={isTouchDevice ? handleTouchStart : undefined}
      onTouchMove={isTouchDevice ? handleTouchMove : undefined}
      onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
      onTouchCancel={isTouchDevice ? handleTouchEnd : undefined}
    >
      <div>
        <h3 className="font-medium">{officer.name}</h3>
        <p className="text-xs text-muted-foreground">
          {officer.rank}
          {officer.currentIncidentId && 
            <span className="ml-1 text-amber-600 dark:text-amber-400">• Assigned</span>
          }
        </p>
      </div>
      <OfficerStatusBadge status={officer.status} />
    </div>
  );
};

export default DraggableOfficerCard;
