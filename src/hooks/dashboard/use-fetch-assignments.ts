
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ASSIGNMENTS } from './constants';

/**
 * Hook for fetching officer assignments from Supabase
 */
export function useFetchAssignments() {
  // Fetch officer assignments from Supabase
  return useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('officer_assignments')
        .select('*');
      
      if (error) throw error;
      
      // Transform the data into our assignment structure
      const assignments: Record<string, string[]> = {};
      
      // Initialize all assignments with empty arrays
      ASSIGNMENTS.forEach(assignment => {
        assignments[assignment] = [];
      });
      
      // Populate assignments from the database
      if (data) {
        data.forEach(item => {
          if (ASSIGNMENTS.includes(item.assignment_name)) {
            assignments[item.assignment_name].push(item.officer_id);
          }
        });
      }
      
      return assignments;
    } catch (error) {
      console.error('Error fetching officer assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load officer assignments',
        variant: 'destructive',
      });
      return {};
    }
  }, []);
}
