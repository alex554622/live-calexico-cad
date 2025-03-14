
import React, { useState, useRef, useEffect } from 'react';
import { Officer } from '@/types';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';
import { useTouchDevice } from '@/hooks/use-touch-device';

interface AssignmentBlockProps {
  title: string;
  officers: Officer[];
  onDrop: (e: React.DragEvent<HTMLDivElement>, assignmentId: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, officer: Officer) => void;
}

const AssignmentBlock: React.FC<AssignmentBlockProps> = ({ 
  title, 
  officers,
  onDrop,
  onDragStart
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTouchOver, setIsTouchOver] = useState(false);
  const isTouchDevice = useTouchDevice();
  const blockRef = useRef<HTMLDivElement>(null);

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
    onDrop(e, title);
  };

  // Touch event handlers - for officer items within assignment
  const handleTouchStart = (e: React.TouchEvent, officer: Officer) => {
    if (onDragStart && isTouchDevice) {
      // Create a synthetic drag event
      const dragEvent = new Event('dragstart', { bubbles: true }) as unknown as React.DragEvent<HTMLDivElement>;
      
      // Add the data transfer functionality
      Object.defineProperty(dragEvent, 'dataTransfer', {
        value: {
          setData: (type: string, val: string) => {
            (window as any).touchDragData = { type, val };
          },
          effectAllowed: "move"
        }
      });
      
      // Call the onDragStart handler
      onDragStart(dragEvent as React.DragEvent<HTMLDivElement>, officer);
    }
  };

  // Listen for touch drag events to highlight drop target
  useEffect(() => {
    if (!isTouchDevice) return;

    const handleTouchDragMove = (e: CustomEvent) => {
      if (!blockRef.current) return;
      
      const { x, y } = e.detail;
      const rect = blockRef.current.getBoundingClientRect();
      
      // Check if touch position is within this assignment block
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
      if (!blockRef.current) return;
      
      const { x, y, officerId, assignmentId } = e.detail;
      const rect = blockRef.current.getBoundingClientRect();
      
      // Check if touch position is within this assignment block
      if (
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom &&
        assignmentId === title
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
        onDrop(dropEvent as React.DragEvent<HTMLDivElement>, title);
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
  }, [isTouchDevice, onDrop, title]);

  return (
    <div 
      ref={blockRef}
      data-assignment-id={title}
      className={`border rounded-lg p-2 h-32 overflow-y-auto transition-colors duration-200
      ${isDragOver || isTouchOver ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' : ''}
      ${officers.length > 0 ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800/50'}
      ${isTouchDevice ? 'touch-action-manipulation' : ''}`}
      onDragOver={!isTouchDevice ? handleDragOver : undefined}
      onDragLeave={!isTouchDevice ? handleDragLeave : undefined}
      onDrop={!isTouchDevice ? handleDrop : undefined}
    >
      <h3 className="font-medium text-xs mb-1 text-foreground dark:text-gray-100">{title}</h3>
      <div className="space-y-1">
        {officers.map((officer) => (
          <div 
            key={officer.id} 
            className={`flex items-center justify-between bg-white dark:bg-gray-700 p-1 rounded shadow-sm cursor-move transition-transform active:scale-95
              ${isTouchDevice ? 'active:opacity-70' : ''}`}
            draggable={!isTouchDevice}
            onDragStart={!isTouchDevice && onDragStart ? (e) => onDragStart(e, officer) : undefined}
            onTouchStart={isTouchDevice ? (e) => handleTouchStart(e, officer) : undefined}
          >
            <div className="text-xs truncate max-w-[100px] dark:text-white">{officer.name}</div>
            <OfficerStatusBadge status={officer.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentBlock;
