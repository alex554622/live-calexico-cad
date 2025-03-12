
import { useState, useCallback } from 'react';
import { Officer } from '@/types';
import { 
  getOfficers, 
  updateOfficerStatus, 
  createOfficer as apiCreateOfficer,
  updateOfficer as apiUpdateOfficer,
  deleteOfficer as apiDeleteOfficer
} from '@/services/officers';
import { useToast } from '@/hooks/use-toast';

export const useOfficers = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const { toast } = useToast();

  const fetchOfficers = useCallback(async () => {
    try {
      setLoadingOfficers(true);
      const data = await getOfficers();
      setOfficers(data);
    } catch (error) {
      console.error('Error fetching officers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch officers data',
        variant: 'destructive',
      });
    } finally {
      setLoadingOfficers(false);
    }
  }, [toast]);

  const updateOfficerStatusWrapper = async (officerId: string, status: Officer['status'], incidentId?: string) => {
    try {
      const updatedOfficer = await updateOfficerStatus(officerId, status, incidentId);
      setOfficers(prev => 
        prev.map(officer => officer.id === updatedOfficer.id ? updatedOfficer : officer)
      );
      return updatedOfficer;
    } catch (error) {
      console.error('Error updating officer status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update officer status',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createOfficerWrapper = async (officerData: Omit<Officer, 'id' | 'lastUpdated'>) => {
    try {
      const newOfficer = await apiCreateOfficer(officerData);
      setOfficers(prev => [newOfficer, ...prev]);
      return newOfficer;
    } catch (error) {
      console.error('Error creating officer:', error);
      toast({
        title: 'Error',
        description: 'Failed to create officer',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateOfficerWrapper = async (officerId: string, updates: Partial<Officer>) => {
    try {
      const updatedOfficer = await apiUpdateOfficer(officerId, updates);
      setOfficers(prev => 
        prev.map(officer => officer.id === updatedOfficer.id ? updatedOfficer : officer)
      );
      return updatedOfficer;
    } catch (error) {
      console.error('Error updating officer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update officer',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteOfficerWrapper = async (officerId: string) => {
    try {
      await apiDeleteOfficer(officerId);
      setOfficers(prev => prev.filter(officer => officer.id !== officerId));
      return;
    } catch (error) {
      console.error('Error deleting officer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete officer',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    officers,
    loadingOfficers,
    fetchOfficers,
    updateOfficerStatus: updateOfficerStatusWrapper,
    createOfficer: createOfficerWrapper,
    updateOfficer: updateOfficerWrapper,
    deleteOfficer: deleteOfficerWrapper,
  };
};
