
import { useState, useCallback } from 'react';
import { Incident, Officer } from '@/types';
import { 
  getIncidents, 
  updateIncident, 
  createIncident, 
  assignOfficerToIncident,
  deleteIncident as apiDeleteIncident
} from '@/services/incidents';
import { updateOfficerStatus } from '@/services/officers';
import { useToast } from '@/hooks/use-toast';

export const useIncidents = (setOfficers?: React.Dispatch<React.SetStateAction<Officer[]>>) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const { toast } = useToast();

  const fetchIncidents = useCallback(async () => {
    try {
      setLoadingIncidents(true);
      const data = await getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch incidents data',
        variant: 'destructive',
      });
    } finally {
      setLoadingIncidents(false);
    }
  }, [toast]);

  const updateIncidentWrapper = async (incidentId: string, updates: Partial<Incident>) => {
    try {
      const updatedIncident = await updateIncident(incidentId, updates);
      setIncidents(prev => 
        prev.map(incident => incident.id === updatedIncident.id ? updatedIncident : incident)
      );
      return updatedIncident;
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: 'Error',
        description: 'Failed to update incident',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createIncidentWrapper = async (incidentData: Omit<Incident, 'id' | 'reportedAt' | 'updatedAt'>) => {
    try {
      const newIncident = await createIncident(incidentData);
      setIncidents(prev => [newIncident, ...prev]);
      return newIncident;
    } catch (error) {
      console.error('Error creating incident:', error);
      toast({
        title: 'Error',
        description: 'Failed to create incident',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const assignOfficerToIncidentWrapper = async (incidentId: string, officerId: string) => {
    try {
      const { incident, officer } = await assignOfficerToIncident(incidentId, officerId);
      
      setIncidents(prev => 
        prev.map(i => i.id === incident.id ? incident : i)
      );
      
      if (setOfficers) {
        setOfficers(prev => 
          prev.map(o => o.id === officer.id ? officer : o)
        );
      }
      
      return { incident, officer };
    } catch (error) {
      console.error('Error assigning officer to incident:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign officer to incident',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteIncidentWrapper = async (incidentId: string, officers: Officer[]) => {
    try {
      await apiDeleteIncident(incidentId);
      setIncidents(prev => prev.filter(incident => incident.id !== incidentId));
      
      const assignedOfficers = officers.filter(officer => officer.currentIncidentId === incidentId);
      for (const officer of assignedOfficers) {
        await updateOfficerStatus(officer.id, 'available');
      }
      
      return;
    } catch (error) {
      console.error('Error deleting incident:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete incident',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    incidents,
    loadingIncidents,
    fetchIncidents,
    updateIncident: updateIncidentWrapper,
    createIncident: createIncidentWrapper,
    assignOfficerToIncident: assignOfficerToIncidentWrapper,
    deleteIncident: deleteIncidentWrapper,
  };
};
