
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
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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
    
    const handleTouchDragEnd = () => {
      setIsTouchOver(false);
    };
    
    const handleTouchDrop = (e: CustomEvent) => {
      if (!sectionRef.current) return;
      
      const { x, y, officerId } = e.detail;
      const rect = sectionRef.current.getBoundingClientRect();
      
      // Check if touch position is within this section
      if (
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom
      ) {
        // Create a synthetic drop event
        const dropEvent = new Event('drop', { bubbles: true }) as unknown as React.DragEvent<HTMLDivElement>;
        
        // Add the dataTransfer object
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: {
            getData: () => officerId
          }
        });
        
        // Call the onDrop handler
        onOfficerDrop(dropEvent);
      }
      
      setIsTouchOver(false);
    };
    
    // Register event listeners
    window.addEventListener('touchdragmove', handleTouchDragMove as EventListener);
    window.addEventListener('touchdragend', handleTouchDragEnd as EventListener);
    window.addEventListener('touchdrop', handleTouchDrop as EventListener);
    
    return () => {
      window.removeEventListener('touchdragmove', handleTouchDragMove as EventListener);
      window.removeEventListener('touchdragend', handleTouchDragEnd as EventListener);
      window.removeEventListener('touchdrop', handleTouchDrop as EventListener);
    };
  }, [isTouchDevice, onOfficerDrop]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Officers</h2>
      </div>
      <div 
        ref={sectionRef}
        onDragOver={!isTouchDevice ? handleDragOver : undefined}
        onDragLeave={!isTouchDevice ? handleDragLeave : undefined}
        onDrop={!isTouchDevice ? handleDrop : undefined}
        className={`border-2 border-dashed rounded-lg p-2 transition-colors duration-200
          ${(isDragOver || isTouchOver) 
            ? 'border-primary bg-primary/10' 
            : 'border-transparent hover:border-primary'}`}
        data-drop-target="officers-list"
      >
        {availableOfficers.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground border rounded-lg">
            All officers are currently assigned to assignments
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
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
