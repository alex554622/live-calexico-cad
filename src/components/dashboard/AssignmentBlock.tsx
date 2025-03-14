
import React, { useState } from 'react';
import { Officer } from '@/types';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragOver(false);
    onDrop(e, title);
  };

  return (
    <div 
      className={`border rounded-lg p-2 h-32 overflow-y-auto transition-colors duration-200
      ${isDragOver ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' : ''}
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
            className="flex items-center justify-between bg-white dark:bg-gray-700 p-1 rounded shadow-sm cursor-move transition-transform active:scale-95"
            draggable
            onDragStart={(e) => onDragStart && onDragStart(e, officer)}
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
