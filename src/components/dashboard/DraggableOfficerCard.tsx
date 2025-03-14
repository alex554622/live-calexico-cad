
import React from 'react';
import { Officer } from '@/types';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';

interface DraggableOfficerCardProps {
  officer: Officer;
  onClick: () => void;
}

const DraggableOfficerCard: React.FC<DraggableOfficerCardProps> = ({ 
  officer, 
  onClick 
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("officerId", officer.id);
  };

  return (
    <div 
      className="border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors flex items-center justify-between"
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
    >
      <div>
        <h3 className="font-medium">{officer.name}</h3>
        <p className="text-xs text-muted-foreground">{officer.rank}</p>
      </div>
      <OfficerStatusBadge status={officer.status} />
    </div>
  );
};

export default DraggableOfficerCard;
