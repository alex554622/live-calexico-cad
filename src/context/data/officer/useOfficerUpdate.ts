
import { useCallback } from 'react';
import { Officer } from '@/types';
import { supabase } from '@/lib/supabase';

export function useOfficerUpdate(toast: any, setOfficers: React.Dispatch<React.SetStateAction<Officer[]>>) {
  // Update officer status
  const updateOfficerStatus = useCallback(async (officerId: string, status: Officer['status'], incidentId?: string) => {
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
  }, [toast, setOfficers]);

  // Update officer
  const updateOfficer = useCallback(async (officerId: string, updates: Partial<Officer>) => {
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
  }, [toast, setOfficers]);

  return { updateOfficerStatus, updateOfficer };
}
