import React, { useState, useRef, useEffect } from 'react';
import { Incident } from '@/types';
import IncidentCard from './IncidentCard';
import { useTouchDevice } from '@/hooks/use-touch-device';

interface RecentIncidentsSectionProps {
  incidents: Incident[];
  onIncidentClick: (incident: Incident) => void;
  onOfficerDrop: (e: React.DragEvent<HTMLDivElement>, incident: Incident) => void;
  canReceiveDrop?: boolean;
}

const RecentIncidentsSection: React.FC<RecentIncidentsSectionProps> = ({
  incidents,
  onIncidentClick,
  onOfficerDrop,
  canReceiveDrop = true,
}) => {
  const isTouchDevice = useTouchDevice();
  const [activeDrop, setActiveDrop] = useState<string | null>(null);
  const [activeTouchDrop, setActiveTouchDrop] = useState<string | null>(null);
  const incidentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Mouse drag handlers
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

  // Touch event handlers
  useEffect(() => {
    if (!isTouchDevice) return;
    
    const handleTouchDragMove = (e: CustomEvent) => {
      const { x, y } = e.detail;
      
      // Check each incident card to see if the touch is over it
      let foundIncident = false;
      
      incidents.forEach(incident => {
        const ref = incidentRefs.current.get(incident.id);
        if (!ref) return;
        
        const rect = ref.getBoundingClientRect();
        if (
          x >= rect.left && 
          x <= rect.right && 
          y >= rect.top && 
          y <= rect.bottom
        ) {
          setActiveTouchDrop(incident.id);
          foundIncident = true;
        }
      });
      
      if (!foundIncident) {
        setActiveTouchDrop(null);
      }
    };
    
    const handleTouchDragEnd = () => {
      setActiveTouchDrop(null);
    };
    
    const handleTouchDrop = (e: CustomEvent) => {
      const { x, y, officerId } = e.detail;
      
      // Find which incident the officer was dropped on
      incidents.forEach(incident => {
        const ref = incidentRefs.current.get(incident.id);
        if (!ref) return;
        
        const rect = ref.getBoundingClientRect();
        if (
          x >= rect.left && 
          x <= rect.right && 
          y >= rect.top && 
          y <= rect.bottom
        ) {
          // Create a synthetic drop event
          const dropEvent = new Event('drop', { bubbles: true }) as unknown as React.DragEvent<HTMLDivElement>;
          
          // Add the dataTransfer object
          Object.defineProperty(dropEvent, 'dataTransfer', {
            value: {
              getData: () => officerId
            }
          });
          
          // Call the onDrop handler
          onOfficerDrop(dropEvent, incident);
        }
      });
      
      setActiveTouchDrop(null);
    };
    
    // Register event listeners
    window.addEventListener('touchdragmove', handleTouchDragMove as EventListener);
    window.addEventListener('touchdragend', handleTouchDragEnd as EventListener);
    window.addEventListener('touchdrop', handleTouchDrop as EventListener);
    
    return () => {
      window.removeEventListener('touchdragmove', handleTouchDragMove as EventListener);
      window.removeEventListener('touchdragend', handleTouchDragEnd as EventListener);
      window.removeEventListener('touchdrop', handleTouchDrop as EventListener);
    };
  }, [isTouchDevice, incidents, onOfficerDrop]);

  // Save refs to incident elements
  const setIncidentRef = (incidentId: string, element: HTMLDivElement | null) => {
    if (element) {
      incidentRefs.current.set(incidentId, element);
    } else {
      incidentRefs.current.delete(incidentId);
    }
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
            ref={(el) => setIncidentRef(incident.id, el)}
            onDragOver={canReceiveDrop && !isTouchDevice ? (e) => handleDragOver(e, incident.id) : undefined}
            onDragLeave={canReceiveDrop && !isTouchDevice ? handleDragLeave : undefined}
            onDrop={canReceiveDrop && !isTouchDevice ? (e) => handleDrop(e, incident) : undefined}
            className={`border-2 border-dashed rounded-lg p-1 transition-colors
              ${(activeDrop === incident.id || activeTouchDrop === incident.id)
                ? 'bg-primary/5 border-primary' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary'}
              ${isTouchDevice ? 'touch-action-pan-y' : ''}`}
            data-incident-id={incident.id}
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
