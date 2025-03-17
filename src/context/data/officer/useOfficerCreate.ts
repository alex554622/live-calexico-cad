
import { useCallback } from 'react';
import { Officer } from '@/types';
import { supabase } from '@/lib/supabase';

export function useOfficerCreate(toast: any, setOfficers: React.Dispatch<React.SetStateAction<Officer[]>>) {
  // Create new officer
  const createOfficer = useCallback(async (officer: Omit<Officer, 'id' | 'lastUpdated'>) => {
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
  }, [toast, setOfficers]);

  return { createOfficer };
}
