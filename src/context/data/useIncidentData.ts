
import { useState, useCallback, useEffect } from 'react';
import { Incident, Officer } from '@/types';
import { supabase } from '@/lib/supabase';

export function useIncidentData(
  toast: any, 
  officers: Officer[], 
  fetchOfficers: () => Promise<void>
) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);

  // Fetch incidents from Supabase
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

  // Update incident
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

  // Create new incident
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

  // Delete incident
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
      
      // Refresh the officers list as some might have been updated
      await fetchOfficers();
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

  // Assign officer to incident
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
      setIncidents(prev => 
        prev.map(i => i.id === updatedIncident.id ? updatedIncident : i)
      );
      
      // Refresh officers list to reflect the updated officer
      await fetchOfficers();
      
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

  // Set up real-time subscription for incidents
  useEffect(() => {
    const incidentsChannel = supabase
      .channel('incidents-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'incidents' }, 
        async () => {
          await fetchIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(incidentsChannel);
    };
  }, [fetchIncidents]);

  return {
    incidents,
    loadingIncidents,
    fetchIncidents,
    updateIncident,
    createIncident,
    deleteIncident,
    assignOfficerToIncident
  };
}
