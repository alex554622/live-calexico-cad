
import React, { createContext, useContext, useCallback } from 'react';
import { Officer, Incident, Notification } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../AuthContext';
import { useOfficerData } from './useOfficerData';
import { useIncidentData } from './useIncidentData';
import { useNotificationData } from './useNotificationData';

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
  const { toast } = useToast();
  const { user } = useAuth();

  // Use our specialized hooks for each data type
  const {
    officers,
    loadingOfficers,
    fetchOfficers,
    updateOfficerStatus,
    createOfficer,
    updateOfficer,
    deleteOfficer
  } = useOfficerData(toast);

  const {
    incidents,
    loadingIncidents,
    fetchIncidents,
    updateIncident,
    createIncident,
    deleteIncident,
    assignOfficerToIncident
  } = useIncidentData(toast, officers, fetchOfficers);

  const {
    notifications,
    loadingNotifications,
    fetchNotifications,
    markNotificationAsRead,
    deleteReadNotifications
  } = useNotificationData(toast);

  // Function to refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchOfficers(),
      fetchIncidents(),
      fetchNotifications()
    ]);
  }, [fetchOfficers, fetchIncidents, fetchNotifications]);

  // Fetch data when user is authenticated
  React.useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  // Context value
  const value: DataContextType = {
    officers,
    incidents,
    notifications,
    loadingOfficers,
    loadingIncidents,
    loadingNotifications,
    refreshData,
    updateOfficerStatus,
    updateIncident,
    createIncident,
    assignOfficerToIncident,
    markNotificationAsRead,
    createOfficer,
    updateOfficer,
    deleteOfficer,
    deleteIncident,
    deleteReadNotifications,
  };

  return (
    <DataContext.Provider value={value}>
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
