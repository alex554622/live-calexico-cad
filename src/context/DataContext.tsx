
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

  const fetchOfficers = useCallback(async () => {
    try {
      setLoadingOfficers(true);
      
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching officers:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch officers data',
          variant: 'destructive',
        });
        return;
      }
      
      // Transform the data to match our application's structure
      const formattedOfficers: Officer[] = data.map(officer => ({
        id: officer.id,
        badgeNumber: officer.badge_number,
        name: officer.name,
        rank: officer.rank,
        department: officer.department,
        status: officer.status as Officer['status'],
        contactInfo: {
          phone: officer.contact_phone || '',
          email: officer.contact_email || '',
        },
        shiftSchedule: officer.shift_schedule,
        location: officer.location_lat && officer.location_lng ? {
          lat: officer.location_lat,
          lng: officer.location_lng,
        } : undefined,
        currentIncidentId: officer.current_incident_id,
        lastUpdated: officer.last_updated,
      }));
      
      setOfficers(formattedOfficers);
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
      
      // Fetch incidents
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .order('reported_at', { ascending: false });
      
      if (incidentsError) {
        console.error('Error fetching incidents:', incidentsError);
        toast({
          title: 'Error',
          description: 'Failed to fetch incidents data',
          variant: 'destructive',
        });
        return;
      }
      
      // Fetch assigned officers
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('incident_officers')
        .select('*');
      
      if (assignmentsError) {
        console.error('Error fetching incident assignments:', assignmentsError);
      }
      
      // Create assignment map
      const assignmentMap: Record<string, string[]> = {};
      if (assignmentsData) {
        assignmentsData.forEach((assignment) => {
          if (!assignmentMap[assignment.incident_id]) {
            assignmentMap[assignment.incident_id] = [];
          }
          assignmentMap[assignment.incident_id].push(assignment.officer_id);
        });
      }
      
      // Transform the data to match our application's structure
      const formattedIncidents: Incident[] = incidentsData.map(incident => ({
        id: incident.id,
        title: incident.title,
        description: incident.description,
        location: {
          address: incident.location_address,
          lat: incident.location_lat,
          lng: incident.location_lng,
        },
        priority: incident.priority as Incident['priority'],
        status: incident.status as Incident['status'],
        assignedOfficers: assignmentMap[incident.id] || [],
        reportedAt: incident.reported_at,
        updatedAt: incident.updated_at,
        reportedBy: incident.reported_by,
        documentLink: incident.document_link,
      }));
      
      setIncidents(formattedIncidents);
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
      
      if (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch notifications',
          variant: 'destructive',
        });
        return;
      }
      
      // Transform the data to match our application's structure
      const formattedNotifications: Notification[] = data.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type as Notification['type'],
        timestamp: notification.timestamp,
        read: notification.read,
        relatedTo: notification.related_to_type ? {
          type: notification.related_to_type as 'officer' | 'incident' | 'user',
          id: notification.related_to_id,
        } : undefined,
      }));
      
      setNotifications(formattedNotifications);
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

  const updateOfficerStatus = async (officerId: string, status: Officer['status'], incidentId?: string) => {
    try {
      // Update officer status in the database
      const { data, error } = await supabase
        .from('officers')
        .update({
          status,
          current_incident_id: incidentId,
          last_updated: new Date().toISOString()
        })
        .eq('id', officerId)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating officer status:', error);
        throw error;
      }
      
      // Create a notification
      await supabase
        .from('notifications')
        .insert({
          title: 'Officer Status Updated',
          message: `${data.name} is now ${status}`,
          type: 'info',
          related_to_type: 'officer',
          related_to_id: officerId
        });
      
      // Transform the data to match our application's structure
      const updatedOfficer: Officer = {
        id: data.id,
        badgeNumber: data.badge_number,
        name: data.name,
        rank: data.rank,
        department: data.department,
        status: data.status as Officer['status'],
        contactInfo: {
          phone: data.contact_phone || '',
          email: data.contact_email || '',
        },
        shiftSchedule: data.shift_schedule,
        location: data.location_lat && data.location_lng ? {
          lat: data.location_lat,
          lng: data.location_lng,
        } : undefined,
        currentIncidentId: data.current_incident_id,
        lastUpdated: data.last_updated,
      };
      
      // Update the local state
      setOfficers(prev => 
        prev.map(officer => officer.id === updatedOfficer.id ? updatedOfficer : officer)
      );
      
      // Refresh notifications
      fetchNotifications();
      
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
      // Convert the updates to the database structure
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.documentLink !== undefined) dbUpdates.document_link = updates.documentLink;
      
      if (updates.location) {
        if (updates.location.address) dbUpdates.location_address = updates.location.address;
        if (updates.location.lat) dbUpdates.location_lat = updates.location.lat;
        if (updates.location.lng) dbUpdates.location_lng = updates.location.lng;
      }
      
      dbUpdates.updated_at = new Date().toISOString();
      
      // Update the incident in the database
      const { data, error } = await supabase
        .from('incidents')
        .update(dbUpdates)
        .eq('id', incidentId)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating incident:', error);
        throw error;
      }
      
      // Create a notification
      await supabase
        .from('notifications')
        .insert({
          title: 'Incident Updated',
          message: `${data.title} has been updated`,
          type: 'info',
          related_to_type: 'incident',
          related_to_id: incidentId
        });
      
      // Fetch the incident's assigned officers
      const { data: assignmentsData } = await supabase
        .from('incident_officers')
        .select('officer_id')
        .eq('incident_id', incidentId);
      
      const assignedOfficers = assignmentsData ? assignmentsData.map(a => a.officer_id) : [];
      
      // Transform the data to match our application's structure
      const updatedIncident: Incident = {
        id: data.id,
        title: data.title,
        description: data.description,
        location: {
          address: data.location_address,
          lat: data.location_lat,
          lng: data.location_lng,
        },
        priority: data.priority as Incident['priority'],
        status: data.status as Incident['status'],
        assignedOfficers,
        reportedAt: data.reported_at,
        updatedAt: data.updated_at,
        reportedBy: data.reported_by,
        documentLink: data.document_link,
      };
      
      // Update the local state
      setIncidents(prev => 
        prev.map(incident => incident.id === updatedIncident.id ? updatedIncident : incident)
      );
      
      // Refresh notifications
      fetchNotifications();
      
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
      // Convert the incident to the database structure
      const dbIncident = {
        title: incident.title,
        description: incident.description,
        location_address: incident.location.address,
        location_lat: incident.location.lat,
        location_lng: incident.location.lng,
        priority: incident.priority,
        status: incident.status,
        reported_by: incident.reportedBy,
        document_link: incident.documentLink
      };
      
      // Insert the incident into the database
      const { data, error } = await supabase
        .from('incidents')
        .insert(dbIncident)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating incident:', error);
        throw error;
      }
      
      // If there are assigned officers, create the assignments
      if (incident.assignedOfficers && incident.assignedOfficers.length > 0) {
        const assignments = incident.assignedOfficers.map(officerId => ({
          incident_id: data.id,
          officer_id: officerId
        }));
        
        const { error: assignmentError } = await supabase
          .from('incident_officers')
          .insert(assignments);
        
        if (assignmentError) {
          console.error('Error creating officer assignments:', assignmentError);
        }
      }
      
      // Create a notification
      await supabase
        .from('notifications')
        .insert({
          title: 'New Incident Reported',
          message: `${data.title} at ${data.location_address}`,
          type: 'warning',
          related_to_type: 'incident',
          related_to_id: data.id
        });
      
      // Transform the data to match our application's structure
      const newIncident: Incident = {
        id: data.id,
        title: data.title,
        description: data.description,
        location: {
          address: data.location_address,
          lat: data.location_lat,
          lng: data.location_lng,
        },
        priority: data.priority as Incident['priority'],
        status: data.status as Incident['status'],
        assignedOfficers: incident.assignedOfficers || [],
        reportedAt: data.reported_at,
        updatedAt: data.updated_at,
        reportedBy: data.reported_by,
        documentLink: data.document_link,
      };
      
      // Update the local state
      setIncidents(prev => [newIncident, ...prev]);
      
      // Refresh notifications
      fetchNotifications();
      
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
      // Check if the assignment already exists
      const { data: existingAssignment, error: checkError } = await supabase
        .from('incident_officers')
        .select('*')
        .eq('incident_id', incidentId)
        .eq('officer_id', officerId)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking existing assignment:', checkError);
      }
      
      // If the assignment doesn't exist, create it
      if (!existingAssignment) {
        const { error: assignmentError } = await supabase
          .from('incident_officers')
          .insert({
            incident_id: incidentId,
            officer_id: officerId
          });
        
        if (assignmentError) {
          console.error('Error creating assignment:', assignmentError);
          throw assignmentError;
        }
      }
      
      // Update the officer's status and current incident
      const { data: updatedOfficerData, error: officerError } = await supabase
        .from('officers')
        .update({
          status: 'responding',
          current_incident_id: incidentId,
          last_updated: new Date().toISOString()
        })
        .eq('id', officerId)
        .select('*')
        .single();
      
      if (officerError) {
        console.error('Error updating officer:', officerError);
        throw officerError;
      }
      
      // Get the incident details
      const { data: incidentData, error: incidentError } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', incidentId)
        .single();
      
      if (incidentError) {
        console.error('Error fetching incident:', incidentError);
        throw incidentError;
      }
      
      // Get all assigned officers for this incident
      const { data: assignedOfficersData } = await supabase
        .from('incident_officers')
        .select('officer_id')
        .eq('incident_id', incidentId);
      
      const assignedOfficers = assignedOfficersData ? assignedOfficersData.map(a => a.officer_id) : [];
      
      // Create a notification
      await supabase
        .from('notifications')
        .insert({
          title: 'Officer Assigned',
          message: `${updatedOfficerData.name} assigned to ${incidentData.title}`,
          type: 'success',
          related_to_type: 'incident',
          related_to_id: incidentId
        });
      
      // Transform the data to match our application's structure
      const updatedOfficer: Officer = {
        id: updatedOfficerData.id,
        badgeNumber: updatedOfficerData.badge_number,
        name: updatedOfficerData.name,
        rank: updatedOfficerData.rank,
        department: updatedOfficerData.department,
        status: updatedOfficerData.status as Officer['status'],
        contactInfo: {
          phone: updatedOfficerData.contact_phone || '',
          email: updatedOfficerData.contact_email || '',
        },
        shiftSchedule: updatedOfficerData.shift_schedule,
        location: updatedOfficerData.location_lat && updatedOfficerData.location_lng ? {
          lat: updatedOfficerData.location_lat,
          lng: updatedOfficerData.location_lng,
        } : undefined,
        currentIncidentId: updatedOfficerData.current_incident_id,
        lastUpdated: updatedOfficerData.last_updated,
      };
      
      const updatedIncident: Incident = {
        id: incidentData.id,
        title: incidentData.title,
        description: incidentData.description,
        location: {
          address: incidentData.location_address,
          lat: incidentData.location_lat,
          lng: incidentData.location_lng,
        },
        priority: incidentData.priority as Incident['priority'],
        status: incidentData.status as Incident['status'],
        assignedOfficers,
        reportedAt: incidentData.reported_at,
        updatedAt: incidentData.updated_at,
        reportedBy: incidentData.reported_by,
        documentLink: incidentData.document_link,
      };
      
      // Update the local state
      setOfficers(prev => 
        prev.map(o => o.id === updatedOfficer.id ? updatedOfficer : o)
      );
      
      setIncidents(prev => 
        prev.map(i => i.id === updatedIncident.id ? updatedIncident : i)
      );
      
      // Refresh notifications
      fetchNotifications();
      
      return { incident: updatedIncident, officer: updatedOfficer };
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
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
      
      // Transform the data to match our application's structure
      const updatedNotification: Notification = {
        id: data.id,
        title: data.title,
        message: data.message,
        type: data.type as Notification['type'],
        timestamp: data.timestamp,
        read: data.read,
        relatedTo: data.related_to_type ? {
          type: data.related_to_type as 'officer' | 'incident' | 'user',
          id: data.related_to_id,
        } : undefined,
      };
      
      // Update the local state
      setNotifications(prev => 
        prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
      );
      
      return updatedNotification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const createOfficer = async (officer: Omit<Officer, 'id' | 'lastUpdated'>) => {
    try {
      // Convert the officer to the database structure
      const dbOfficer = {
        badge_number: officer.badgeNumber,
        name: officer.name,
        rank: officer.rank,
        department: officer.department,
        status: officer.status,
        contact_phone: officer.contactInfo?.phone,
        contact_email: officer.contactInfo?.email,
        shift_schedule: officer.shiftSchedule,
        location_lat: officer.location?.lat,
        location_lng: officer.location?.lng
      };
      
      // Insert the officer into the database
      const { data, error } = await supabase
        .from('officers')
        .insert(dbOfficer)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating officer:', error);
        throw error;
      }
      
      // Create a notification
      await supabase
        .from('notifications')
        .insert({
          title: 'New Officer Added',
          message: `${data.name} has been added to the system`,
          type: 'info',
          related_to_type: 'officer',
          related_to_id: data.id
        });
      
      // Transform the data to match our application's structure
      const newOfficer: Officer = {
        id: data.id,
        badgeNumber: data.badge_number,
        name: data.name,
        rank: data.rank,
        department: data.department,
        status: data.status as Officer['status'],
        contactInfo: {
          phone: data.contact_phone || '',
          email: data.contact_email || '',
        },
        shiftSchedule: data.shift_schedule,
        location: data.location_lat && data.location_lng ? {
          lat: data.location_lat,
          lng: data.location_lng,
        } : undefined,
        currentIncidentId: data.current_incident_id,
        lastUpdated: data.last_updated,
      };
      
      // Update the local state
      setOfficers(prev => [newOfficer, ...prev]);
      
      // Refresh notifications
      fetchNotifications();
      
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
      // Convert the updates to the database structure
      const dbUpdates: any = {};
      
      if (updates.badgeNumber !== undefined) dbUpdates.badge_number = updates.badgeNumber;
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.rank !== undefined) dbUpdates.rank = updates.rank;
      if (updates.department !== undefined) dbUpdates.department = updates.department;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.shiftSchedule !== undefined) dbUpdates.shift_schedule = updates.shiftSchedule;
      
      if (updates.contactInfo) {
        if (updates.contactInfo.phone !== undefined) dbUpdates.contact_phone = updates.contactInfo.phone;
        if (updates.contactInfo.email !== undefined) dbUpdates.contact_email = updates.contactInfo.email;
      }
      
      if (updates.location) {
        if (updates.location.lat !== undefined) dbUpdates.location_lat = updates.location.lat;
        if (updates.location.lng !== undefined) dbUpdates.location_lng = updates.location.lng;
      }
      
      dbUpdates.last_updated = new Date().toISOString();
      
      // Update the officer in the database
      const { data, error } = await supabase
        .from('officers')
        .update(dbUpdates)
        .eq('id', officerId)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating officer:', error);
        throw error;
      }
      
      // Create a notification
      await supabase
        .from('notifications')
        .insert({
          title: 'Officer Updated',
          message: `${data.name}'s information has been updated`,
          type: 'info',
          related_to_type: 'officer',
          related_to_id: officerId
        });
      
      // Transform the data to match our application's structure
      const updatedOfficer: Officer = {
        id: data.id,
        badgeNumber: data.badge_number,
        name: data.name,
        rank: data.rank,
        department: data.department,
        status: data.status as Officer['status'],
        contactInfo: {
          phone: data.contact_phone || '',
          email: data.contact_email || '',
        },
        shiftSchedule: data.shift_schedule,
        location: data.location_lat && data.location_lng ? {
          lat: data.location_lat,
          lng: data.location_lng,
        } : undefined,
        currentIncidentId: data.current_incident_id,
        lastUpdated: data.last_updated,
      };
      
      // Update the local state
      setOfficers(prev => 
        prev.map(officer => officer.id === updatedOfficer.id ? updatedOfficer : officer)
      );
      
      // Refresh notifications
      fetchNotifications();
      
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
      // Get the officer details before deletion
      const { data: officerData, error: fetchError } = await supabase
        .from('officers')
        .select('name')
        .eq('id', officerId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching officer details:', fetchError);
        throw fetchError;
      }
      
      // Delete the officer from the database
      const { error } = await supabase
        .from('officers')
        .delete()
        .eq('id', officerId);
      
      if (error) {
        console.error('Error deleting officer:', error);
        throw error;
      }
      
      // Create a notification
      await supabase
        .from('notifications')
        .insert({
          title: 'Officer Removed',
          message: `${officerData.name} has been removed from the system`,
          type: 'warning',
          related_to_type: 'officer',
          related_to_id: officerId
        });
      
      // Update the local state
      setOfficers(prev => prev.filter(officer => officer.id !== officerId));
      
      // Update incidents that had this officer assigned
      // The incident_officers records will be automatically deleted due to the ON DELETE CASCADE constraint
      
      // Refresh incidents and notifications
      await Promise.all([
        fetchIncidents(),
        fetchNotifications()
      ]);
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
      // Get the incident details before deletion
      const { data: incidentData, error: fetchError } = await supabase
        .from('incidents')
        .select('title')
        .eq('id', incidentId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching incident details:', fetchError);
        throw fetchError;
      }
      
      // Update any officers assigned to this incident
      const { data: assignedOfficers } = await supabase
        .from('incident_officers')
        .select('officer_id')
        .eq('incident_id', incidentId);
      
      if (assignedOfficers && assignedOfficers.length > 0) {
        for (const { officer_id } of assignedOfficers) {
          await supabase
            .from('officers')
            .update({
              status: 'available',
              current_incident_id: null,
              last_updated: new Date().toISOString()
            })
            .eq('id', officer_id)
            .eq('current_incident_id', incidentId);
        }
      }
      
      // Delete the incident from the database
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', incidentId);
      
      if (error) {
        console.error('Error deleting incident:', error);
        throw error;
      }
      
      // Create a notification
      await supabase
        .from('notifications')
        .insert({
          title: 'Incident Removed',
          message: `${incidentData.title} has been removed from the system`,
          type: 'warning',
          related_to_type: 'incident',
          related_to_id: incidentId
        });
      
      // Update the local state
      setIncidents(prev => prev.filter(incident => incident.id !== incidentId));
      
      // Update any officers that were assigned to this incident
      setOfficers(prev => prev.map(officer => {
        if (officer.currentIncidentId === incidentId) {
          return {
            ...officer,
            status: 'available',
            currentIncidentId: undefined,
            lastUpdated: new Date().toISOString()
          };
        }
        return officer;
      }));
      
      // Refresh notifications
      fetchNotifications();
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
      // Count read notifications before deletion
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', true);
      
      if (countError) {
        console.error('Error counting read notifications:', countError);
        throw countError;
      }
      
      // Delete read notifications
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('read', true);
      
      if (error) {
        console.error('Error deleting read notifications:', error);
        throw error;
      }
      
      // Update the local state
      setNotifications(prev => prev.filter(n => !n.read));
      
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

  // Subscribe to real-time updates for the database tables
  useEffect(() => {
    if (!user) return;

    // Create a channel for officers table
    const officersChannel = supabase
      .channel('officers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'officers' }, 
        async (payload) => {
          console.log('Officers change received:', payload);
          // Refresh the officers data
          await fetchOfficers();
        }
      )
      .subscribe();

    // Create a channel for incidents table
    const incidentsChannel = supabase
      .channel('incidents-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'incidents' }, 
        async (payload) => {
          console.log('Incidents change received:', payload);
          // Refresh the incidents data
          await fetchIncidents();
        }
      )
      .subscribe();

    // Create a channel for notifications table
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' }, 
        async (payload) => {
          console.log('Notifications change received:', payload);
          // Refresh the notifications data
          await fetchNotifications();
        }
      )
      .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(officersChannel);
      supabase.removeChannel(incidentsChannel);
      supabase.removeChannel(notificationsChannel);
    };
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
