
import React from 'react';
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
  
  // Handle mouse drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("officerId", officer.id);
    e.dataTransfer.effectAllowed = "move";
    
    // Create a ghost image for dragging
    const ghostElement = document.createElement('div');
    ghostElement.className = 'fixed z-50 bg-primary text-primary-foreground px-3 py-2 rounded-md shadow opacity-80';
    ghostElement.innerText = officer.name;
    document.body.appendChild(ghostElement);
    
    // Set the ghost image and position it
    e.dataTransfer.setDragImage(ghostElement, 20, 20);
    
    // Remove the ghost element after the drag starts
    setTimeout(() => {
      if (ghostElement.parentNode) {
        document.body.removeChild(ghostElement);
      }
    }, 0);
  };
  
  // Touch handlers for touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const officerId = officer.id;
    const name = officer.name;
    
    // Create ghost element for touch dragging
    const ghost = document.createElement('div');
    ghost.className = 'fixed z-50 bg-primary text-primary-foreground px-3 py-2 rounded-md shadow opacity-80';
    ghost.innerHTML = name;
    ghost.id = 'touch-drag-ghost';
    ghost.style.position = 'fixed';
    ghost.style.left = `${touch.clientX - 30}px`;
    ghost.style.top = `${touch.clientY - 30}px`;
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
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!(window as any).touchDragOfficerId) return;
    
    e.preventDefault(); // Prevent scrolling during drag
    const touch = e.touches[0];
    
    // Update ghost element position
    const ghost = document.getElementById('touch-drag-ghost');
    if (ghost) {
      ghost.style.left = `${touch.clientX - 30}px`;
      ghost.style.top = `${touch.clientY - 30}px`;
    }
    
    // Dispatch custom event for drag move
    window.dispatchEvent(new CustomEvent('touchdragmove', { 
      detail: { 
        officerId: officer.id,
        x: touch.clientX,
        y: touch.clientY
      }
    }));
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!(window as any).touchDragOfficerId) return;
    
    const touch = e.changedTouches[0];
    const dropElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const assignmentBlock = dropElement?.closest('[data-assignment-id]');
    
    // Handle dropping on an assignment
    if (assignmentBlock) {
      const assignmentId = assignmentBlock.getAttribute('data-assignment-id');
      if (assignmentId) {
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
      // Check if droppe back to officers list
      const officersList = dropElement?.closest('[data-drop-target="officers-list"]');
      if (officersList) {
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
  };

  return (
    <div 
      className={`border rounded-lg p-3 cursor-move hover:border-primary transition-colors flex items-center justify-between 
        ${officer.currentIncidentId ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/40' : ''}`}
      onClick={onClick}
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
