
import React, { useRef } from 'react';
import { Officer } from '@/types';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';
import { useTouchDevice } from '@/hooks/use-touch-device';
import { useOfficerTouchDrag } from '@/hooks/use-officer-touch-drag';
import { useOfficerMouseDrag } from '@/hooks/use-officer-mouse-drag';
import { useDragCleanup } from '@/hooks/use-drag-cleanup';

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
  
  // Mouse drag functionality
  const [mouseDragState, mouseDragHandlers] = useOfficerMouseDrag(officer);
  const { isDragging } = mouseDragState;
  const { handleDragStart } = mouseDragHandlers;
  
  // Touch drag functionality
  const [touchDragState, touchDragHandlers] = useOfficerTouchDrag(officer, cardRef, onClick);
  const { touchDragging, isDraggable } = touchDragState;
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = touchDragHandlers;
  
  // Cleanup effect
  useDragCleanup(isDraggable, cardRef, isTouchDevice);

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
