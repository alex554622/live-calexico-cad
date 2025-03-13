
import { useCallback } from 'react';
import { Officer, Incident } from '@/types';

interface UseOfficerPageProps {
  incidents: Incident[];
  selectedOfficer: Officer | null;
  setSelectedOfficer: (officer: Officer | null) => void;
  handleUpdateOfficerStatus: () => Promise<Officer | null>;
  handleDeleteSelected: (selectedOfficers: string[]) => Promise<boolean>;
  handleDeleteOfficer: (officerId: string) => Promise<boolean>;
  selectedOfficers: string[];
  setSelectedOfficers: (officers: string[]) => void;
  setIsSelectionMode: (mode: boolean) => void;
}

export function useOfficerPage({
  incidents,
  selectedOfficer,
  setSelectedOfficer,
  handleUpdateOfficerStatus,
  handleDeleteSelected,
  handleDeleteOfficer,
  selectedOfficers,
  setSelectedOfficers,
  setIsSelectionMode
}: UseOfficerPageProps) {
  
  // Helper function to get officer's current incident
  const getOfficerIncident = useCallback((officer: Officer) => {
    if (!officer.currentIncidentId) return null;
    return incidents.find(incident => incident.id === officer.currentIncidentId) || null;
  }, [incidents]);

  // Handler for updating officer status
  const handleUpdateStatus = useCallback(async () => {
    const updatedOfficer = await handleUpdateOfficerStatus();
    
    if (updatedOfficer && selectedOfficer && selectedOfficer.id === updatedOfficer.id) {
      setSelectedOfficer(updatedOfficer);
    }
  }, [handleUpdateOfficerStatus, selectedOfficer, setSelectedOfficer]);

  // Handler for deleting selected officers
  const handleDeleteSelectedConfirm = useCallback(async () => {
    const success = await handleDeleteSelected(selectedOfficers);
    if (success) {
      setSelectedOfficers([]);
      setIsSelectionMode(false);
    }
  }, [handleDeleteSelected, selectedOfficers, setSelectedOfficers, setIsSelectionMode]);

  // Handler for deleting a single officer
  const handleSingleOfficerDelete = useCallback(async (officerId: string) => {
    const success = await handleDeleteOfficer(officerId);
    if (success) {
      setSelectedOfficer(null);
    }
  }, [handleDeleteOfficer, setSelectedOfficer]);

  return {
    getOfficerIncident,
    handleUpdateStatus,
    handleDeleteSelectedConfirm,
    handleSingleOfficerDelete
  };
}
