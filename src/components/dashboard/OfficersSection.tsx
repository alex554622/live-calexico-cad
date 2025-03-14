
import React from 'react';
import { Officer } from '@/types';
import DraggableOfficerCard from './DraggableOfficerCard';

interface OfficersSectionProps {
  officers: Officer[];
  onOfficerClick: (officer: Officer) => void;
}

const OfficersSection: React.FC<OfficersSectionProps> = ({
  officers,
  onOfficerClick,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Officers</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
        {officers.map((officer) => (
          <DraggableOfficerCard 
            key={officer.id} 
            officer={officer} 
            onClick={() => onOfficerClick(officer)}
          />
        ))}
      </div>
    </div>
  );
};

export default OfficersSection;
