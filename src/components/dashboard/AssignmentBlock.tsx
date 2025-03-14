
import React from 'react';
import { Officer } from '@/types';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';

interface AssignmentBlockProps {
  title: string;
  officers: Officer[];
  onDrop: (e: React.DragEvent<HTMLDivElement>, assignmentId: string) => void;
}

const AssignmentBlock: React.FC<AssignmentBlockProps> = ({ 
  title, 
  officers,
  onDrop
}) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div 
      className={`border rounded-lg p-4 h-40 overflow-y-auto ${officers.length > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}
      onDragOver={handleDragOver}
      onDrop={(e) => onDrop(e, title)}
    >
      <h3 className="font-medium text-sm mb-2">{title}</h3>
      <div className="space-y-2">
        {officers.map((officer) => (
          <div key={officer.id} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
            <div className="text-xs truncate">{officer.name}</div>
            <OfficerStatusBadge status={officer.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentBlock;
