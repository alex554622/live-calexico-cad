
import React from 'react';
import { Officer } from '@/types';
import DraggableOfficerCard from '../DraggableOfficerCard';

interface OfficersGridProps {
  officers: Officer[];
  onOfficerClick: (officer: Officer) => void;
  draggable: boolean;
}

const OfficersGrid: React.FC<OfficersGridProps> = ({ 
  officers, 
  onOfficerClick, 
  draggable 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2">
      {officers.map((officer) => (
        <DraggableOfficerCard 
          key={officer.id} 
          officer={officer} 
          onClick={() => onOfficerClick(officer)}
          draggable={draggable}
        />
      ))}
    </div>
  );
};

export default OfficersGrid;
