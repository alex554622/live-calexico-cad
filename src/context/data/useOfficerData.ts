
import { useState, useCallback, useEffect } from 'react';
import { Officer } from '@/types';
import { supabase } from '@/lib/supabase';

export function useOfficerData(toast: any) {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);

  // Fetch officers from Supabase
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

  // Update officer status
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

  // Create new officer
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

  // Update officer
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

  // Delete officer
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

  // Set up real-time subscription for officers
  useEffect(() => {
    const officersChannel = supabase
      .channel('officers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'officers' }, 
        async () => {
          await fetchOfficers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(officersChannel);
    };
  }, [fetchOfficers]);

  return {
    officers,
    loadingOfficers,
    fetchOfficers,
    updateOfficerStatus,
    createOfficer,
    updateOfficer,
    deleteOfficer
  };
}
