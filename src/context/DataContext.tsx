import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Officer, Incident, Notification } from '../types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

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

  // Function to convert Supabase officers to our app's Officer type
  const mapDbOfficerToAppOfficer = (dbOfficer: any): Officer => {
    return {
      id: dbOfficer.id,
      name: dbOfficer.name,
      rank: dbOfficer.rank,
      badgeNumber: dbOfficer.badge_number,
      status: dbOfficer.status,
      department: dbOfficer.department,
      shiftSchedule: dbOfficer.shift_schedule,
      currentIncidentId: dbOfficer.current_incident_id,
      lastUpdated: dbOfficer.last_updated,
      contactInfo: dbOfficer.contact_info
    };
  };

  // Function to convert Supabase incidents to our app's Incident type
  const mapDbIncidentToAppIncident = (dbIncident: any): Incident => {
    return {
      id: dbIncident.id,
      title: dbIncident.title,
      description: dbIncident.description,
      status: dbIncident.status,
      priority: dbIncident.priority,
      location: dbIncident.location,
      reportedAt: dbIncident.reported_at,
      updatedAt: dbIncident.updated_at,
      assignedOfficers: dbIncident.assigned_officers,
      type: dbIncident.type,
      reportedBy: dbIncident.reported_by || 'Unknown'
    };
  };

  // Function to convert Supabase notifications to our app's Notification type
  const mapDbNotificationToAppNotification = (dbNotification: any): Notification => {
    return {
      id: dbNotification.id,
      title: dbNotification.title,
      message: dbNotification.message,
      type: dbNotification.type,
      timestamp: dbNotification.timestamp,
      read: dbNotification.read,
      relatedTo: dbNotification.related_to
    };
  };

  const fetchOfficers = useCallback(async () => {
    try {
      setLoadingOfficers(true);
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .order('last_updated', { ascending: false });
        
      if (error) throw error;
      
      setOfficers(data.map(mapDbOfficerToAppOfficer));
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
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('reported_at', { ascending: false });
        
      if (error) throw error;
      
      setIncidents(data.map(mapDbIncidentToAppIncident));
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
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      
      setNotifications(data.map(mapDbNotificationToAppNotification));
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
      
      // Set up real-time subscriptions
      const officersSubscription = supabase
        .channel('public:officers')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'officers' 
        }, payload => {
          if (payload.eventType === 'INSERT') {
            setOfficers(prev => [mapDbOfficerToAppOfficer(payload.new), ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOfficers(prev => 
              prev.map(officer => officer.id === payload.new.id ? 
                mapDbOfficerToAppOfficer(payload.new) : officer
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setOfficers(prev => prev.filter(officer => officer.id !== payload.old.id));
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
            setIncidents(prev => [mapDbIncidentToAppIncident(payload.new), ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setIncidents(prev => 
              prev.map(incident => incident.id === payload.new.id ? 
                mapDbIncidentToAppIncident(payload.new) : incident
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setIncidents(prev => prev.filter(incident => incident.id !== payload.old.id));
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
            setNotifications(prev => [mapDbNotificationToAppNotification(payload.new), ...prev]);
            
            // Show toast for new notifications
            toast({
              title: payload.new.title,
              description: payload.new.message,
            });
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(notification => notification.id === payload.new.id ? 
                mapDbNotificationToAppNotification(payload.new) : notification
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(notification => notification.id !== payload.old.id));
          }
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(officersSubscription);
        supabase.removeChannel(incidentsSubscription);
        supabase.removeChannel(notificationsSubscription);
      };
    }
  }, [user, refreshData, toast]);

  const updateOfficerStatus = async (officerId: string, status: Officer['status'], incidentId?: string) => {
    try {
      const now = new Date().toISOString();
      
      // Update officer in Supabase
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
      
      // Create notification
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
      toast({
        title: 'Error',
        description: 'Failed to update officer status',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateIncident = async (incidentId: string, updates: Partial<Incident>) => {
    try {
      const now = new Date().toISOString();
      
      // Transform app incident to db format
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.location) dbUpdates.location = updates.location;
      if (updates.assignedOfficers) dbUpdates.assigned_officers = updates.assignedOfficers;
      if (updates.type) dbUpdates.type = updates.type;
      dbUpdates.updated_at = now;
      
      // Update incident in Supabase
      const { data, error } = await supabase
        .from('incidents')
        .update(dbUpdates)
        .eq('id', incidentId)
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedIncident = mapDbIncidentToAppIncident(data);
      
      // Create notification
      await supabase.from('notifications').insert({
        title: 'Incident Updated',
        message: `${updatedIncident.title} has been updated`,
        type: 'info',
        timestamp: now,
        read: false,
        related_to: {
          type: 'incident',
          id: incidentId
        }
      });
      
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

  const createIncident = async (incident: Omit<Incident, 'id' | 'reportedAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      
      // Create incident in Supabase
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          title: incident.title,
          description: incident.description,
          status: incident.status,
          priority: incident.priority,
          location: incident.location,
          reported_at: now,
          updated_at: now,
          assigned_officers: incident.assignedOfficers || [],
          type: incident.type
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newIncident = mapDbIncidentToAppIncident(data);
      
      // Create notification
      await supabase.from('notifications').insert({
        title: 'New Incident Reported',
        message: `${newIncident.title} at ${newIncident.location.address}`,
        type: 'warning',
        timestamp: now,
        read: false,
        related_to: {
          type: 'incident',
          id: newIncident.id
        }
      });
      
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

  const assignOfficerToIncident = async (incidentId: string, officerId: string) => {
    try {
      const now = new Date().toISOString();
      
      // Get the incident
      const { data: incidentData, error: incidentError } = await supabase
        .from('incidents')
        .select()
        .eq('id', incidentId)
        .single();
        
      if (incidentError) throw incidentError;
      
      // Add officer to assigned_officers if not already there
      const assignedOfficers = [...(incidentData.assigned_officers || [])];
      if (!assignedOfficers.includes(officerId)) {
        assignedOfficers.push(officerId);
      }
      
      // Update the incident
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
      
      // Update the officer
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
      
      // Create notification
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
      toast({
        title: 'Error',
        description: 'Failed to assign officer to incident',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // Update notification in Supabase
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select()
        .single();
        
      if (error) throw error;
      
      return mapDbNotificationToAppNotification(data);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const createOfficer = async (officer: Omit<Officer, 'id' | 'lastUpdated'>) => {
    try {
      const now = new Date().toISOString();
      
      // Create officer in Supabase
      const { data, error } = await supabase
        .from('officers')
        .insert({
          name: officer.name,
          rank: officer.rank,
          badge_number: officer.badgeNumber,
          status: officer.status || 'available',
          department: officer.department,
          shift_schedule: officer.shiftSchedule,
          current_incident_id: officer.currentIncidentId,
          last_updated: now,
          contact_info: officer.contactInfo
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newOfficer = mapDbOfficerToAppOfficer(data);
      
      // Create notification
      await supabase.from('notifications').insert({
        title: 'New Officer Added',
        message: `${newOfficer.name} has been added to the system`,
        type: 'info',
        timestamp: now,
        read: false,
        related_to: {
          type: 'officer',
          id: newOfficer.id
        }
      });
      
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

  const updateOfficer = async (officerId: string, updates: Partial<Officer>) => {
    try {
      const now = new Date().toISOString();
      
      // Transform app officer to db format
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.rank) dbUpdates.rank = updates.rank;
      if (updates.badgeNumber) dbUpdates.badge_number = updates.badgeNumber;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.department) dbUpdates.department = updates.department;
      if (updates.shiftSchedule !== undefined) dbUpdates.shift_schedule = updates.shiftSchedule;
      if (updates.currentIncidentId !== undefined) dbUpdates.current_incident_id = updates.currentIncidentId;
      if (updates.contactInfo) dbUpdates.contact_info = updates.contactInfo;
      dbUpdates.last_updated = now;
      
      // Update officer in Supabase
      const { data, error } = await supabase
        .from('officers')
        .update(dbUpdates)
        .eq('id', officerId)
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedOfficer = mapDbOfficerToAppOfficer(data);
      
      // Create notification
      await supabase.from('notifications').insert({
        title: 'Officer Updated',
        message: `${updatedOfficer.name}'s information has been updated`,
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
      console.error('Error updating officer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update officer',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteOfficer = async (officerId: string) => {
    try {
      // First, get the officer to be deleted for notification
      const { data: officerData, error: getError } = await supabase
        .from('officers')
        .select()
        .eq('id', officerId)
        .single();
        
      if (getError) throw getError;
      
      // Delete the officer
      const { error: deleteError } = await supabase
        .from('officers')
        .delete()
        .eq('id', officerId);
        
      if (deleteError) throw deleteError;
      
      // Create notification
      await supabase.from('notifications').insert({
        title: 'Officer Removed',
        message: `${officerData.name} has been removed from the system`,
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        related_to: {
          type: 'officer',
          id: officerId
        }
      });
      
      // Update any incidents that had this officer assigned
      const { data: incidentsWithOfficer } = await supabase
        .from('incidents')
        .select()
        .contains('assigned_officers', [officerId]);
        
      if (incidentsWithOfficer && incidentsWithOfficer.length > 0) {
        for (const incident of incidentsWithOfficer) {
          await supabase
            .from('incidents')
            .update({
              assigned_officers: incident.assigned_officers.filter((id: string) => id !== officerId),
              updated_at: new Date().toISOString()
            })
            .eq('id', incident.id);
        }
      }
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

  const deleteIncident = async (incidentId: string) => {
    try {
      // First, get the incident to be deleted for notification
      const { data: incidentData, error: getError } = await supabase
        .from('incidents')
        .select()
        .eq('id', incidentId)
        .single();
        
      if (getError) throw getError;
      
      // Delete the incident
      const { error: deleteError } = await supabase
        .from('incidents')
        .delete()
        .eq('id', incidentId);
        
      if (deleteError) throw deleteError;
      
      // Create notification
      await supabase.from('notifications').insert({
        title: 'Incident Removed',
        message: `${incidentData.title} has been removed from the system`,
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        related_to: {
          type: 'incident',
          id: incidentId
        }
      });
      
      // Update any officers assigned to this incident
      const { data: officersWithIncident } = await supabase
        .from('officers')
        .select()
        .eq('current_incident_id', incidentId);
        
      if (officersWithIncident && officersWithIncident.length > 0) {
        for (const officer of officersWithIncident) {
          await supabase
            .from('officers')
            .update({
              status: 'available',
              current_incident_id: null,
              last_updated: new Date().toISOString()
            })
            .eq('id', officer.id);
        }
      }
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

  const deleteReadNotifications = async () => {
    try {
      // First, count the read notifications
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', true);
        
      if (countError) throw countError;
      
      if (count === 0) return 0;
      
      // Delete the read notifications
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('read', true);
        
      if (deleteError) throw deleteError;
      
      return count || 0;
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
