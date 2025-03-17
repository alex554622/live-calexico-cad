
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Officer } from '@/types';

export function useOfficerDelete(toast: any, setOfficers: React.Dispatch<React.SetStateAction<Officer[]>>) {
  // Delete officer
  const deleteOfficer = useCallback(async (officerId: string) => {
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
  }, [toast, setOfficers]);

  return { deleteOfficer };
}
