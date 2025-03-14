
import React, { useRef } from 'react';
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
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Handle mouse drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("officerId", officer.id);
    e.dataTransfer.effectAllowed = "move";
    
    // Create a ghost element for better visual feedback
    const ghostElement = document.createElement('div');
    ghostElement.id = 'drag-ghost';
    ghostElement.className = 'fixed z-50 pointer-events-none bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 opacity-90';
    ghostElement.innerHTML = `<div>${officer.name}</div>`;
    document.body.appendChild(ghostElement);
    
    // Update ghost position during drag
    const updateGhostPosition = (e: MouseEvent) => {
      const ghost = document.getElementById('drag-ghost');
      if (ghost) {
        ghost.style.left = `${e.clientX + 10}px`;
        ghost.style.top = `${e.clientY + 10}px`;
      }
    };
    
    document.addEventListener('mousemove', updateGhostPosition);
    
    // Clean up when drag ends
    const cleanup = () => {
      document.removeEventListener('mousemove', updateGhostPosition);
      const ghost = document.getElementById('drag-ghost');
      if (ghost) document.body.removeChild(ghost);
    };
    
    document.addEventListener('dragend', cleanup, { once: true });
  };
  
  // Touch handlers for touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    // For touch devices, dispatch custom event to start drag operation
    const touch = e.touches[0];
    window.dispatchEvent(new CustomEvent('touchdragstart', { 
      detail: { 
        officerId: officer.id,
        name: officer.name,
        x: touch.clientX,
        y: touch.clientY
      }
    }));
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    // Move the dragged element
    const touch = e.touches[0];
    window.dispatchEvent(new CustomEvent('touchdragmove', { 
      detail: { 
        officerId: officer.id,
        x: touch.clientX,
        y: touch.clientY
      }
    }));
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Handle drop operation
    const touch = e.changedTouches[0];
    const dropElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = dropElement?.closest('[data-assignment-id]');
    
    if (dropZone) {
      const assignmentId = dropZone.getAttribute('data-assignment-id');
      if (assignmentId) {
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
    
    window.dispatchEvent(new CustomEvent('touchdragend'));
  };

  return (
    <div 
      ref={cardRef}
      className={`border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors flex items-center justify-between 
        ${officer.currentIncidentId ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/40' : ''}`}
      onClick={isTouchDevice ? onClick : onClick}
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
