
import React from 'react';
import IncidentCard from '@/components/dashboard/IncidentCard';
import { Incident } from '@/types';

interface IncidentsSectionProps {
  incidents: Incident[];
  onIncidentClick: (incident: Incident) => void;
}

const IncidentsSection: React.FC<IncidentsSectionProps> = ({ incidents, onIncidentClick }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Incidents</h2>
      </div>
      <div className="space-y-4">
        {incidents.slice(0, 4).map((incident) => (
          <IncidentCard 
            key={incident.id} 
            incident={incident} 
            onClick={() => onIncidentClick(incident)}
          />
        ))}
      </div>
    </div>
  );
};

export default IncidentsSection;
