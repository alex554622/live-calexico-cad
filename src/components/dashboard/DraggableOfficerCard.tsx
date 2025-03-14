
import React, { useState, useEffect } from 'react';
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
  const isTouchDevice = useTouchDevice();
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const [touchMoved, setTouchMoved] = useState(false);
  
  // Clean up any lingering ghost elements when component unmounts
  useEffect(() => {
    return () => {
      const ghost = document.getElementById('touch-drag-ghost');
      if (ghost && ghost.parentNode) {
        document.body.removeChild(ghost);
      }
      delete (window as any).touchDragOfficerId;
    };
  }, []);
  
  // Handle mouse drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("officerId", officer.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
    
    // Create a ghost image for dragging
    const ghostElement = document.createElement('div');
    ghostElement.className = 'fixed z-50 bg-primary text-primary-foreground px-3 py-2 rounded-md shadow opacity-80';
    ghostElement.innerText = officer.name;
    ghostElement.id = 'drag-ghost';
    document.body.appendChild(ghostElement);
    
    // Set the ghost image and position it
    e.dataTransfer.setDragImage(ghostElement, 20, 20);
    
    // Remove the ghost element after the drag starts
    setTimeout(() => {
      if (document.getElementById('drag-ghost')) {
        document.body.removeChild(ghostElement);
      }
    }, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Cleanup any lingering ghost elements
    const ghost = document.getElementById('touch-drag-ghost');
    if (ghost && ghost.parentNode) {
      document.body.removeChild(ghost);
    }
  };
  
  // Touch handlers for touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    
    // Record touch start time to differentiate between tap and drag
    setTouchStartTime(Date.now());
    setTouchMoved(false);
    
    // Don't prevent default here to allow scrolling
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    
    // If this is the first move event, check if it's been long enough to start a drag
    const touchDuration = touchStartTime ? Date.now() - touchStartTime : 0;
    
    // Only start drag if touch has been held for at least 200ms
    if (touchDuration < 200) {
      return;
    }
    
    setTouchMoved(true);
    
    // Now we're definitely dragging, so prevent scrolling
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const officerId = officer.id;
    const name = officer.name;
    
    // Create ghost element for touch dragging if it doesn't exist yet
    let ghost = document.getElementById('touch-drag-ghost');
    if (!ghost) {
      ghost = document.createElement('div');
      ghost.className = 'fixed z-50 bg-primary text-primary-foreground px-3 py-2 rounded-md shadow opacity-80';
      ghost.innerHTML = name;
      ghost.id = 'touch-drag-ghost';
      ghost.style.position = 'fixed';
      ghost.style.pointerEvents = 'none';
      document.body.appendChild(ghost);
      
      // Store data for the drag operation
      (window as any).touchDragOfficerId = officerId;
      
      // Dispatch custom event to indicate drag start
      window.dispatchEvent(new CustomEvent('touchdragstart', { 
        detail: { 
          officerId: officerId,
          name: name,
          x: touch.clientX,
          y: touch.clientY
        }
      }));
    }
    
    // Update ghost element position
    ghost.style.left = `${touch.clientX - 30}px`;
    ghost.style.top = `${touch.clientY - 30}px`;
    
    // Dispatch custom event for drag move
    window.dispatchEvent(new CustomEvent('touchdragmove', { 
      detail: { 
        officerId: (window as any).touchDragOfficerId,
        x: touch.clientX,
        y: touch.clientY
      }
    }));
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    
    // If we didn't actually move, treat as a click
    if (!touchMoved && touchStartTime && Date.now() - touchStartTime < 500) {
      onClick();
      return;
    }
    
    // If we haven't created a drag operation, don't proceed
    if (!(window as any).touchDragOfficerId) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.changedTouches[0];
    const dropElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const assignmentBlock = dropElement?.closest('[data-assignment-id]');
    
    console.log('Touch end - drop element:', dropElement);
    console.log('Assignment block found:', assignmentBlock);
    
    // Handle dropping on an assignment
    if (assignmentBlock) {
      const assignmentId = assignmentBlock.getAttribute('data-assignment-id');
      if (assignmentId) {
        console.log('Touch drop on assignment:', assignmentId);
        
        window.dispatchEvent(new CustomEvent('touchdrop', { 
          detail: { 
            officerId: (window as any).touchDragOfficerId,
            assignmentId: assignmentId,
            x: touch.clientX,
            y: touch.clientY
          }
        }));
      }
    } else {
      // Check if dropped back to officers list
      const officersList = dropElement?.closest('[data-drop-target="officers-list"]');
      if (officersList) {
        console.log('Touch drop back to officers list');
        
        window.dispatchEvent(new CustomEvent('touchdroptolist', { 
          detail: { 
            officerId: (window as any).touchDragOfficerId
          }
        }));
      }
    }
    
    // Clean up
    const ghost = document.getElementById('touch-drag-ghost');
    if (ghost && ghost.parentNode) {
      document.body.removeChild(ghost);
    }
    delete (window as any).touchDragOfficerId;
    
    window.dispatchEvent(new CustomEvent('touchdragend'));
    
    // Reset touch tracking state
    setTouchStartTime(null);
    setTouchMoved(false);
  };

  return (
    <div 
      className={`border rounded-lg p-3 hover:border-primary transition-colors flex items-center justify-between 
        ${isDragging ? 'opacity-50' : ''}
        ${officer.currentIncidentId ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/40' : ''}
        ${isTouchDevice ? 'active:bg-primary/10' : 'cursor-move'}`}
      onClick={isTouchDevice ? undefined : onClick}
      draggable={!isTouchDevice}
      onDragStart={!isTouchDevice ? handleDragStart : undefined}
      onDragEnd={!isTouchDevice ? handleDragEnd : undefined}
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
