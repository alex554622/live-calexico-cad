
import { useEffect } from 'react';
import { Officer, Incident, Notification } from '@/types';
import { simulateRealTimeUpdates } from '@/services/realtime';
import { useToast } from '@/hooks/use-toast';

export const useRealTimeUpdates = (
  user: any | null,
  setOfficers: React.Dispatch<React.SetStateAction<Officer[]>>,
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>,
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    const handleOfficerUpdate = (updatedOfficer: Officer) => {
      setOfficers(prev => 
        prev.map(officer => officer.id === updatedOfficer.id ? updatedOfficer : officer)
      );
      
      toast({
        title: 'Officer Status Updated',
        description: `${updatedOfficer.name} is now ${updatedOfficer.status}`,
      });
    };
    
    const handleIncidentUpdate = (updatedIncident: Incident) => {
      setIncidents(prev => 
        prev.map(incident => incident.id === updatedIncident.id ? updatedIncident : incident)
      );
      
      toast({
        title: 'Incident Updated',
        description: `${updatedIncident.title} status: ${updatedIncident.status}`,
      });
    };
    
    const handleNewNotification = (newNotification: Notification) => {
      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: newNotification.title,
        description: newNotification.message,
      });
    };
    
    const cleanup = simulateRealTimeUpdates(
      handleOfficerUpdate,
      handleIncidentUpdate,
      handleNewNotification
    );
    
    return cleanup;
  }, [user, toast, setOfficers, setIncidents, setNotifications]);
};
