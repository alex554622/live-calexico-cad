
import { useState, useCallback } from 'react';
import { Incident } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { mapDbIncidentToAppIncident } from '@/utils/mappers';

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const { toast } = useToast();

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

  const createIncident = async (incident: Omit<Incident, 'id' | 'reportedAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      
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
          type: incident.type,
          reported_by: incident.reportedBy
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newIncident = mapDbIncidentToAppIncident(data);
      
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

  const updateIncident = async (incidentId: string, updates: Partial<Incident>) => {
    try {
      const now = new Date().toISOString();
      
      const dbUpdates: any = {
        updated_at: now
      };
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.location) dbUpdates.location = updates.location;
      if (updates.assignedOfficers) dbUpdates.assigned_officers = updates.assignedOfficers;
      if (updates.type) dbUpdates.type = updates.type;
      
      const { data, error } = await supabase
        .from('incidents')
        .update(dbUpdates)
        .eq('id', incidentId)
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedIncident = mapDbIncidentToAppIncident(data);
      
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

  const deleteIncident = async (incidentId: string) => {
    try {
      const { data: incidentData, error: getError } = await supabase
        .from('incidents')
        .select()
        .eq('id', incidentId)
        .single();
        
      if (getError) throw getError;
      
      const { error: deleteError } = await supabase
        .from('incidents')
        .delete()
        .eq('id', incidentId);
        
      if (deleteError) throw deleteError;
      
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
    createIncident,
    updateIncident,
    deleteIncident
  };
};
