
import React from 'react';
import OfficerCard from '@/components/dashboard/OfficerCard';
import { Officer } from '@/types';

interface OfficersSectionProps {
  officers: Officer[];
  onOfficerClick: (officer: Officer) => void;
}

const OfficersSection: React.FC<OfficersSectionProps> = ({ officers, onOfficerClick }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Officers</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {officers.slice(0, 6).map((officer) => (
          <OfficerCard 
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
