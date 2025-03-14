
import { useState } from 'react';
import { Officer, Incident } from '@/types';

/**
 * Hook for managing selection state in the dashboard
 */
export function useDashboardSelection() {
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  
  return {
    selectedOfficer,
    setSelectedOfficer,
    selectedIncident,
    setSelectedIncident
  };
}
