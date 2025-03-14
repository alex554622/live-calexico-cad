
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
    
    try {
      onDrop(e, title);
    } catch (error) {
      console.error(`Error dropping on assignment ${title}:`, error);
    }
  };

  // Touch event handlers
  useEffect(() => {
    if (!isTouchDevice || !blockRef.current) return;

    const currentBlockRef = blockRef.current;

    const handleTouchDragMove = (e: CustomEvent) => {
      if (!currentBlockRef) return;
      
      const { x, y } = e.detail;
      const rect = currentBlockRef.getBoundingClientRect();
      
      // Check if touch position is within this assignment block
      const isOver = 
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom;
      
      setIsTouchOver(isOver);
      
      // If over this block, update potential drop target visually
      if (isOver && (window as any).touchDragOfficerId) {
        document.querySelectorAll('[data-assignment-id]').forEach(el => {
          el.classList.remove('touch-drag-target');
        });
        currentBlockRef.classList.add('touch-drag-target');
      }
    };
    
    const handleTouchDragEnd = (e: CustomEvent) => {
      setIsTouchOver(false);
      currentBlockRef.classList.remove('touch-drag-target');
      
      // If touch ended over this block and we have a dragged officer, dispatch drop event
      if (isTouchOver && (window as any).touchDragOfficerId) {
        const officerId = (window as any).touchDragOfficerId;
        
        // Custom event to be handled by Dashboard component
        const touchDropEvent = new CustomEvent('touchdrop', {
          detail: {
            officerId,
            assignmentId: title
          }
        });
        
        window.dispatchEvent(touchDropEvent);
      }
    };
    
    // Register event listeners
    window.addEventListener('touchdragmove', handleTouchDragMove as EventListener);
    window.addEventListener('touchdragend', handleTouchDragEnd as EventListener);
    
    return () => {
      window.removeEventListener('touchdragmove', handleTouchDragMove as EventListener);
      window.removeEventListener('touchdragend', handleTouchDragEnd as EventListener);
      currentBlockRef.classList.remove('touch-drag-target');
    };
  }, [isTouchDevice, title, isTouchOver]);

  return (
    <div 
      ref={blockRef}
      data-assignment-id={title}
      className={`border rounded-lg p-2 h-32 overflow-y-auto transition-colors duration-200
        ${isDragOver || isTouchOver ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' : ''}
        ${officers.length > 0 ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3 className="font-medium text-xs mb-1 text-foreground dark:text-gray-100">{title}</h3>
      <div className="space-y-1">
        {officers.map((officer) => (
          <div 
            key={officer.id} 
            className="flex items-center justify-between bg-white dark:bg-gray-700 p-1 rounded shadow-sm cursor-move"
            draggable={true}
            onDragStart={onDragStart ? (e) => onDragStart(e, officer) : undefined}
            data-officer-id={officer.id}
            data-officer-name={officer.name}
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
