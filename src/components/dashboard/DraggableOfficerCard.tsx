
import React, { useState } from 'react';
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
  const isTouchDevice = useTouchDevice();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("officerId", officer.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
    
    // Add ghost dragging image for better visual feedback
    const dragImg = document.createElement('div');
    dragImg.className = 'invisible';
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, 0, 0);
    
    // Create a dragging element for visual feedback
    const dragElement = document.createElement('div');
    dragElement.className = 'fixed z-50 pointer-events-none bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 opacity-90';
    dragElement.innerHTML = `<div>${officer.name}</div>`;
    dragElement.id = 'drag-ghost';
    document.body.appendChild(dragElement);
    
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
      const ghost = document.getElementById('drag-ghost');
      if (ghost) document.body.removeChild(ghost);
    };
    
    document.addEventListener('dragend', cleanup, { once: true });
  };

  return (
    <div 
      className={`border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors flex items-center justify-between 
        ${officer.currentIncidentId ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/40' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${isTouchDevice ? 'touch-action-pan-y active:opacity-70' : ''}`}
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
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
