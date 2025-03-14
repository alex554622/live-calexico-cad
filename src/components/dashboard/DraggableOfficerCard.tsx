
import React, { useState, useRef } from 'react';
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

  // Touch event handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    initialTouchPosition.current = { x: touch.clientX, y: touch.clientY };
    
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
    }, 300); // 300ms is a good threshold for distinguishing tap vs drag
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
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
    } else {
      // If not dragging, it was a tap, so trigger onClick
      onClick();
    }
  };

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
