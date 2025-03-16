
import React, { useState, useRef, useEffect } from 'react';
import { Officer } from '@/types';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';
import { useTouchDevice } from '@/hooks/use-touch-device';

interface AssignmentBlockProps {
  title: string;
  officers: Officer[];
  onDrop: (e: React.DragEvent<HTMLDivElement>, assignmentId: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, officer: Officer) => void;
  canDragDrop?: boolean;
}

const AssignmentBlock: React.FC<AssignmentBlockProps> = ({ 
  title, 
  officers,
  onDrop,
  onDragStart,
  canDragDrop = true
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTouchOver, setIsTouchOver] = useState(false);
  const isTouchDevice = useTouchDevice();
  const blockRef = useRef<HTMLDivElement>(null);

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
    
    // Log to debug the drop event
    console.log(`Dropping on assignment: ${title}`);
    console.log('Data transferred:', e.dataTransfer.getData('officerId'));
    
    onDrop(e, title);
  };

  // Touch event handlers
  useEffect(() => {
    if (!isTouchDevice || !canDragDrop) return;

    const handleTouchDragMove = (e: CustomEvent) => {
      if (!blockRef.current) return;
      
      const { x, y } = e.detail;
      const rect = blockRef.current.getBoundingClientRect();
      
      // Check if touch position is within this assignment block
      const isOver = 
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom;
      
      setIsTouchOver(isOver);
    };
    
    const handleTouchDragEnd = () => {
      setIsTouchOver(false);
    };
    
    const handleTouchDrop = (e: CustomEvent) => {
      const { assignmentId, officerId } = e.detail;
      
      if (assignmentId === title) {
        console.log(`Touch drop detected - Officer ${officerId} to ${assignmentId}`);
        
        // Create a synthetic event for the drop handler
        const syntheticEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
          dataTransfer: {
            getData: () => officerId
          }
        } as unknown as React.DragEvent<HTMLDivElement>;
        
        onDrop(syntheticEvent, title);
      }
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
  }, [isTouchDevice, title, onDrop, canDragDrop]);

  return (
    <div 
      ref={blockRef}
      data-assignment-id={title}
      className={`border rounded-lg p-2 h-32 overflow-y-auto transition-colors duration-200
        ${isDragOver || isTouchOver ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' : ''}
        ${officers.length > 0 ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}
      onDragOver={canDragDrop ? handleDragOver : undefined}
      onDragLeave={canDragDrop ? handleDragLeave : undefined}
      onDrop={canDragDrop ? handleDrop : undefined}
    >
      <h3 className="font-medium text-xs mb-1 text-foreground dark:text-gray-100">{title}</h3>
      <div className="space-y-1">
        {officers.map((officer) => (
          <div 
            key={officer.id} 
            className="flex items-center justify-between bg-white dark:bg-gray-700 p-1 rounded shadow-sm cursor-move"
            draggable={canDragDrop}
            onDragStart={canDragDrop && onDragStart ? (e) => {
              console.log(`Dragging officer ${officer.name} (${officer.id}) from assignment ${title}`);
              onDragStart(e, officer);
            } : undefined}
            data-officer-id={officer.id}
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
