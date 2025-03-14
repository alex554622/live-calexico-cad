
import React, { useState, useRef, useEffect } from 'react';
import { Officer } from '@/types';
import DraggableOfficerCard from './DraggableOfficerCard';
import { useTouchDevice } from '@/hooks/use-touch-device';

interface OfficersSectionProps {
  officers: Officer[];
  assignedOfficerIds: string[];
  onOfficerClick: (officer: Officer) => void;
  onOfficerDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const OfficersSection: React.FC<OfficersSectionProps> = ({
  officers,
  assignedOfficerIds,
  onOfficerClick,
  onOfficerDrop,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTouchOver, setIsTouchOver] = useState(false);
  const isTouchDevice = useTouchDevice();
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Filter out officers that are already assigned to an assignment
  const availableOfficers = officers.filter(
    officer => !assignedOfficerIds.includes(officer.id)
  );

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Officers</h2>
      </div>
      <div 
        ref={sectionRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-2 transition-colors duration-200
          ${(isDragOver || isTouchOver) 
            ? 'border-primary bg-primary/10' 
            : 'border-transparent hover:border-muted-foreground'}`}
        data-drop-target="officers-list"
      >
        {availableOfficers.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground border rounded-lg">
            All officers are currently assigned to assignments
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2">
            {availableOfficers.map((officer) => (
              <DraggableOfficerCard 
                key={officer.id} 
                officer={officer} 
                onClick={() => onOfficerClick(officer)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficersSection;
