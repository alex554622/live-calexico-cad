
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook for subscribing to real-time assignment changes
 */
export function useAssignmentSubscription(
  fetchOfficerAssignments: () => Promise<void>,
  refreshData: () => void
) {
  // Initialize subscription to real-time changes
  useEffect(() => {
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
}
