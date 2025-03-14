
import React from 'react';
import { Incident } from '@/types';
import IncidentCard from './IncidentCard';

interface RecentIncidentsSectionProps {
  incidents: Incident[];
  onIncidentClick: (incident: Incident) => void;
  onOfficerDrop: (e: React.DragEvent<HTMLDivElement>, incident: Incident) => void;
}

const RecentIncidentsSection: React.FC<RecentIncidentsSectionProps> = ({
  incidents,
  onIncidentClick,
  onOfficerDrop,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Incidents</h2>
      </div>
      <div className="space-y-4">
        {incidents.map((incident) => (
          <div 
            key={incident.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onOfficerDrop(e, incident)}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-1 hover:border-primary transition-colors"
          >
            <IncidentCard 
              incident={incident} 
              onClick={() => onIncidentClick(incident)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentIncidentsSection;
