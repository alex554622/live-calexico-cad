
import React, { useState } from 'react';
import { Incident } from '@/types';
import IncidentCard from './IncidentCard';
import { useTouchDevice } from '@/hooks/use-touch-device';

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
  const isTouchDevice = useTouchDevice();
  const [activeDrop, setActiveDrop] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, incidentId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setActiveDrop(incidentId);
  };
  
  const handleDragLeave = () => {
    setActiveDrop(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, incident: Incident) => {
    setActiveDrop(null);
    onOfficerDrop(e, incident);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Incidents</h2>
      </div>
      <div className={`space-y-4 ${isTouchDevice ? '-webkit-overflow-scrolling-touch' : ''}`}>
        {incidents.map((incident) => (
          <div 
            key={incident.id}
            onDragOver={(e) => handleDragOver(e, incident.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, incident)}
            className={`border-2 border-dashed rounded-lg p-1 transition-colors
              ${activeDrop === incident.id 
                ? 'bg-primary/5 border-primary' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary'}
              ${isTouchDevice ? 'touch-action-pan-y' : ''}`}
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
