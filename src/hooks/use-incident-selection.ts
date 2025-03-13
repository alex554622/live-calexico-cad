
import { useState } from 'react';

export function useIncidentSelection() {
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedIncidents([]);
    }
  };

  const toggleIncidentSelection = (id: string, e: React.MouseEvent) => {
    if (!isSelectionMode) return;
    
    e.stopPropagation();
    
    setSelectedIncidents(prev => {
      if (prev.includes(id)) {
        return prev.filter(incidentId => incidentId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return {
    selectedIncidents,
    setSelectedIncidents,
    isSelectionMode,
    setIsSelectionMode,
    toggleSelectionMode,
    toggleIncidentSelection
  };
}
