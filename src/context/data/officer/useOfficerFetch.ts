
import { useState, useCallback, useEffect } from 'react';
import { Officer } from '@/types';
import { supabase } from '@/lib/supabase';

export function useOfficerFetch(toast: any) {
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
    setOfficers
  };
}
