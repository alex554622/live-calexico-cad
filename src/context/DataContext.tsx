import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Officer, Incident, Notification } from '../types';
import { 
  getOfficers, 
  updateOfficerStatus, 
  createOfficer as apiCreateOfficer,
  updateOfficer as apiUpdateOfficer,
  deleteOfficer as apiDeleteOfficer
} from '../services/officers';
import { 
  getIncidents, 
  updateIncident, 
  createIncident, 
  assignOfficerToIncident,
  deleteIncident as apiDeleteIncident
} from '../services/incidents';
import {
  getNotifications,
  markNotificationAsRead,
  deleteReadNotifications as apiDeleteReadNotifications
} from '../services/notifications';
import { simulateRealTimeUpdates } from '../services/realtime';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface DataContextType {
  officers: Officer[];
  incidents: Incident[];
  notifications: Notification[];
  loadingOfficers: boolean;
  loadingIncidents: boolean;
  loadingNotifications: boolean;
  refreshData: () => Promise<void>;
  updateOfficerStatus: (officerId: string, status: Officer['status'], incidentId?: string) => Promise<Officer>;
  updateIncident: (incidentId: string, updates: Partial<Incident>) => Promise<Incident>;
  createIncident: (incident: Omit<Incident, 'id' | 'reportedAt' | 'updatedAt'>) => Promise<Incident>;
  assignOfficerToIncident: (incidentId: string, officerId: string) => Promise<{ incident: Incident; officer: Officer }>;
  markNotificationAsRead: (notificationId: string) => Promise<Notification>;
  createOfficer: (officer: Omit<Officer, 'id' | 'lastUpdated'>) => Promise<Officer>;
  updateOfficer: (officerId: string, updates: Partial<Officer>) => Promise<Officer>;
  deleteOfficer: (officerId: string) => Promise<void>;
  deleteIncident: (incidentId: string) => Promise<void>;
  deleteReadNotifications: () => Promise<number>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  
  const { toast } = useToast();
  const { user } = useAuth();

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

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive',
      });
    } finally {
      setLoadingNotifications(false);
    }
  }, [toast]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchOfficers(),
      fetchIncidents(),
      fetchNotifications()
    ]);
  }, [fetchOfficers, fetchIncidents, fetchNotifications]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

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
  }, [user, toast]);

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
      
      setOfficers(prev => 
        prev.map(o => o.id === officer.id ? officer : o)
      );
      
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

  const markNotificationAsReadWrapper = async (notificationId: string) => {
    try {
      const updatedNotification = await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
      );
      return updatedNotification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
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

  const deleteIncidentWrapper = async (incidentId: string) => {
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

  const deleteReadNotificationsWrapper = async () => {
    try {
      const deletedCount = await apiDeleteReadNotifications();
      setNotifications(prev => prev.filter(n => !n.read));
      return deletedCount;
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete read notifications',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      officers,
      incidents,
      notifications,
      loadingOfficers,
      loadingIncidents,
      loadingNotifications,
      refreshData,
      updateOfficerStatus: updateOfficerStatusWrapper,
      updateIncident: updateIncidentWrapper,
      createIncident: createIncidentWrapper,
      assignOfficerToIncident: assignOfficerToIncidentWrapper,
      markNotificationAsRead: markNotificationAsReadWrapper,
      createOfficer: createOfficerWrapper,
      updateOfficer: updateOfficerWrapper,
      deleteOfficer: deleteOfficerWrapper,
      deleteIncident: deleteIncidentWrapper,
      deleteReadNotifications: deleteReadNotificationsWrapper,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
