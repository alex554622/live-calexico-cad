
import React from 'react';
import { Officer } from '@/types';
import DraggableOfficerCard from './DraggableOfficerCard';

interface OfficersSectionProps {
  officers: Officer[];
  assignedOfficerIds: string[];
  onOfficerClick: (officer: Officer) => void;
}

const OfficersSection: React.FC<OfficersSectionProps> = ({
  officers,
  assignedOfficerIds,
  onOfficerClick,
}) => {
  // Filter out officers that are already assigned to an assignment
  const availableOfficers = officers.filter(
    officer => !assignedOfficerIds.includes(officer.id)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Officers</h2>
      </div>
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
  );
};

export default OfficersSection;
