
import React, { useState, useEffect, useRef } from 'react';
import { Officer } from '@/types';
import OfficerStatusBadge from '../common/OfficerStatusBadge';
import { Card } from '../ui/card';
import { useTouchDevice } from '@/hooks/use-touch-device';

interface DraggableOfficerCardProps {
  officer: Officer;
  onClick: () => void;
  draggable?: boolean;
}

const DraggableOfficerCard: React.FC<DraggableOfficerCardProps> = ({ 
  officer, 
  onClick,
  draggable = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [touchTimeout, setTouchTimeout] = useState<NodeJS.Timeout | null>(null);
  const isTouchDevice = useTouchDevice();
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartPosRef = useRef<{ x: number, y: number } | null>(null);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!draggable) return;
    
    // Set the officer ID as the drag data
    e.dataTransfer.setData('officerId', officer.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Log to debug
    console.log(`Started dragging officer: ${officer.name} (${officer.id})`);
    
    setIsDragging(true);
    
    // Set drag image (optional)
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(cardRef.current, rect.width / 2, rect.height / 2);
    }
  };
  
  const handleDragEnd = () => {
    console.log(`Ended dragging officer: ${officer.name} (${officer.id})`);
    setIsDragging(false);
  };
  
  // Touch handling for mobile devices
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggable || !isTouchDevice) return;
    
    // Save the touch start position
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    
    // Set a timeout to detect long press (500ms)
    if (touchTimeout) clearTimeout(touchTimeout);
    
    const timeout = setTimeout(() => {
      if (!cardRef.current) return;
      
      // Create ghost element for dragging
      const ghost = document.createElement('div');
      ghost.id = 'touch-drag-ghost';
      ghost.innerHTML = `<div class="bg-white dark:bg-gray-800 p-2 rounded shadow-lg border">${officer.name}</div>`;
      ghost.style.position = 'absolute';
      ghost.style.top = '-1000px';
      ghost.style.zIndex = '9999';
      ghost.style.pointerEvents = 'none';
      document.body.appendChild(ghost);
      
      // Store the officer ID for later use
      (window as any).touchDragOfficerId = officer.id;
      
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Start the drag operation
      setIsDragging(true);
      
      // Prevent default on the card to avoid touch conflicts
      cardRef.current.style.opacity = '0.5';
      
      console.log('Long press detected, starting touch drag for officer', officer.id);
    }, 500);
    
    setTouchTimeout(timeout);
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggable || !isTouchDevice || !isDragging) return;
    if (!touchStartPosRef.current) return;
    
    const touch = e.touches[0];
    const ghost = document.getElementById('touch-drag-ghost');
    
    if (ghost) {
      ghost.style.top = `${touch.clientY - 30}px`;
      ghost.style.left = `${touch.clientX - 50}px`;
      ghost.style.display = 'block';
      
      // Dispatch custom event to notify containers
      const touchMoveEvent = new CustomEvent('touchdragmove', {
        detail: { x: touch.clientX, y: touch.clientY, officerId: officer.id }
      });
      window.dispatchEvent(touchMoveEvent);
    }
    
    // Prevent scrolling during drag
    e.preventDefault();
  };
  
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchTimeout) {
      clearTimeout(touchTimeout);
      setTouchTimeout(null);
    }
    
    if (!isDragging) return;
    
    const ghost = document.getElementById('touch-drag-ghost');
    if (ghost && ghost.parentNode) {
      document.body.removeChild(ghost);
    }
    
    if (isTouchDevice && isDragging) {
      const touch = e.changedTouches[0];
      
      // Reset card appearance
      if (cardRef.current) {
        cardRef.current.style.opacity = '1';
      }
      
      // Find the element under the touch point
      const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
      
      // Look for assignment blocks
      const assignmentBlock = elementsUnderTouch.find(el => 
        el.hasAttribute('data-assignment-id')
      );
      
      if (assignmentBlock) {
        const assignmentId = assignmentBlock.getAttribute('data-assignment-id');
        console.log(`Touch drop detected on assignment: ${assignmentId}`);
        
        // Dispatch custom event for the drop
        const touchDropEvent = new CustomEvent('touchdrop', {
          detail: { 
            assignmentId,
            officerId: officer.id,
            x: touch.clientX,
            y: touch.clientY
          }
        });
        window.dispatchEvent(touchDropEvent);
      }
      
      // Dispatch touchdragend event for any containers listening
      const touchDragEndEvent = new Event('touchdragend');
      window.dispatchEvent(touchDragEndEvent);
      
      setIsDragging(false);
    }
  };
  
  // Cancel the touch timeout when component unmounts
  useEffect(() => {
    return () => {
      if (touchTimeout) {
        clearTimeout(touchTimeout);
      }
    };
  }, [touchTimeout]);

  return (
    <Card
      ref={cardRef}
      className={`p-2 cursor-pointer hover:bg-accent transition-colors
        ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onClick={(e) => {
        // Only trigger click if not dragging
        if (!isDragging) {
          onClick();
        }
      }}
      draggable={draggable && !isTouchDevice}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{officer.name}</div>
          <div className="text-xs text-muted-foreground">{officer.badgeNumber}</div>
        </div>
        <OfficerStatusBadge status={officer.status} />
      </div>
    </Card>
  );
};

export default DraggableOfficerCard;
