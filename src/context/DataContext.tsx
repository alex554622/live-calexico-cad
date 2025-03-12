
import React, { createContext, useContext, useEffect } from 'react';
import { Officer, Incident, Notification } from '../types';
import { useAuth } from './auth';
import { useOfficers } from '@/hooks/use-officers';
import { useIncidents } from '@/hooks/use-incidents';
import { useNotifications } from '@/hooks/use-notifications';
import { supabase } from '@/lib/supabase';
import { mapDbIncidentToAppIncident, mapDbNotificationToAppNotification, mapDbOfficerToAppOfficer } from '@/utils/mappers';

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
  const { user } = useAuth();
  const { 
    officers, loadingOfficers, fetchOfficers,
    createOfficer, updateOfficer, deleteOfficer 
  } = useOfficers();
  
  const {
    incidents, loadingIncidents, fetchIncidents,
    createIncident, updateIncident, deleteIncident
  } = useIncidents();
  
  const {
    notifications, loadingNotifications, fetchNotifications,
    markNotificationAsRead, deleteReadNotifications
  } = useNotifications();

  const refreshData = async () => {
    await Promise.all([
      fetchOfficers(),
      fetchIncidents(),
      fetchNotifications()
    ]);
  };

  const updateOfficerStatus = async (officerId: string, status: Officer['status'], incidentId?: string) => {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('officers')
        .update({
          status,
          current_incident_id: incidentId,
          last_updated: now
        })
        .eq('id', officerId)
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedOfficer = mapDbOfficerToAppOfficer(data);
      
      await supabase.from('notifications').insert({
        title: 'Officer Status Updated',
        message: `${updatedOfficer.name} is now ${status}`,
        type: 'info',
        timestamp: now,
        read: false,
        related_to: {
          type: 'officer',
          id: officerId
        }
      });
      
      return updatedOfficer;
    } catch (error) {
      console.error('Error updating officer status:', error);
      throw error;
    }
  };

  const assignOfficerToIncident = async (incidentId: string, officerId: string) => {
    try {
      const now = new Date().toISOString();
      
      const { data: incidentData, error: incidentError } = await supabase
        .from('incidents')
        .select()
        .eq('id', incidentId)
        .single();
        
      if (incidentError) throw incidentError;
      
      const assignedOfficers = [...(incidentData.assigned_officers || [])];
      if (!assignedOfficers.includes(officerId)) {
        assignedOfficers.push(officerId);
      }
      
      const { data: updatedIncidentData, error: updateIncidentError } = await supabase
        .from('incidents')
        .update({
          assigned_officers: assignedOfficers,
          updated_at: now
        })
        .eq('id', incidentId)
        .select()
        .single();
        
      if (updateIncidentError) throw updateIncidentError;
      
      const { data: updatedOfficerData, error: updateOfficerError } = await supabase
        .from('officers')
        .update({
          status: 'responding',
          current_incident_id: incidentId,
          last_updated: now
        })
        .eq('id', officerId)
        .select()
        .single();
        
      if (updateOfficerError) throw updateOfficerError;
      
      const incident = mapDbIncidentToAppIncident(updatedIncidentData);
      const officer = mapDbOfficerToAppOfficer(updatedOfficerData);
      
      await supabase.from('notifications').insert({
        title: 'Officer Assigned',
        message: `${officer.name} assigned to ${incident.title}`,
        type: 'success',
        timestamp: now,
        read: false,
        related_to: {
          type: 'incident',
          id: incidentId
        }
      });
      
      return { incident, officer };
    } catch (error) {
      console.error('Error assigning officer to incident:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
      
      const officersSubscription = supabase
        .channel('public:officers')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'officers' 
        }, payload => {
          if (payload.eventType === 'INSERT') {
            fetchOfficers();
          } else if (payload.eventType === 'UPDATE') {
            fetchOfficers();
          } else if (payload.eventType === 'DELETE') {
            fetchOfficers();
          }
        })
        .subscribe();
        
      const incidentsSubscription = supabase
        .channel('public:incidents')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'incidents' 
        }, payload => {
          if (payload.eventType === 'INSERT') {
            fetchIncidents();
          } else if (payload.eventType === 'UPDATE') {
            fetchIncidents();
          } else if (payload.eventType === 'DELETE') {
            fetchIncidents();
          }
        })
        .subscribe();
        
      const notificationsSubscription = supabase
        .channel('public:notifications')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications' 
        }, payload => {
          if (payload.eventType === 'INSERT') {
            fetchNotifications();
          } else if (payload.eventType === 'UPDATE') {
            fetchNotifications();
          } else if (payload.eventType === 'DELETE') {
            fetchNotifications();
          }
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(officersSubscription);
        supabase.removeChannel(incidentsSubscription);
        supabase.removeChannel(notificationsSubscription);
      };
    }
  }, [user, fetchOfficers, fetchIncidents, fetchNotifications]);

  return (
    <DataContext.Provider value={{
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
