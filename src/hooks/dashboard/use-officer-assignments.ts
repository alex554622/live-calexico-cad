
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ASSIGNMENTS } from './constants';

/**
 * Hook for fetching and handling officer assignments
 */
export function useOfficerAssignments() {
  const [officerAssignments, setOfficerAssignments] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  // Get all assigned officer IDs across all assignments
  const allAssignedOfficerIds = Object.values(officerAssignments).flat();
  
  // Function to refresh the data
  const refreshData = useCallback(() => {
    setLastRefresh(Date.now());
  }, []);
  
  // Fetch officer assignments from Supabase
  const fetchOfficerAssignments = useCallback(async () => {
    try {
      setLoading(true);
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
      
      setOfficerAssignments(assignments);
    } catch (error) {
      console.error('Error fetching officer assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load officer assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize subscription to real-time changes
  useEffect(() => {
    fetchOfficerAssignments();
    
    // Subscribe to real-time changes
    const assignmentsChannel = supabase
      .channel('officer_assignments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'officer_assignments' }, 
        () => {
          fetchOfficerAssignments();
          refreshData();
          toast({
            title: 'Assignment Updated',
            description: 'An officer has been reassigned.',
          });
        }
      )
      .subscribe();
    
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(assignmentsChannel);
    };
  }, [fetchOfficerAssignments, refreshData]);

  return {
    officerAssignments,
    allAssignedOfficerIds,
    loading,
    lastRefresh,
    refreshData,
    fetchOfficerAssignments,
  };
}
