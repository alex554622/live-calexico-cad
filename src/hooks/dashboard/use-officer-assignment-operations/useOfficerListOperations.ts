
import { useCallback } from 'react';
import { Officer } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useOfficerAssignmentUpdate } from './useOfficerAssignmentUpdate';

/**
 * Hook for handling operations when officers are moved back to the officer list
 */
export function useOfficerListOperations(
  refreshData: () => void,
  updateOfficer: (officerId: string, updates: Partial<Officer>) => Promise<Officer>,
  officers: Officer[] = [],
  updateAssignmentOptimistically?: (officerId: string, assignmentId: string | null) => void
) {
  const { updateOfficerAssignment } = useOfficerAssignmentUpdate();

  // Handle dragging officer back to officer list
  const handleOfficerDropToList = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const officerId = e.dataTransfer.getData("officerId");
    console.log(`Dropping officer ${officerId} back to list`);
    
    if (!officerId) {
      console.error('No officer ID found in drop event');
      return;
    }
    
    const officer = officers.find(o => o.id === officerId);
    if (!officer) {
      console.error(`Officer not found with ID: ${officerId}`);
      return;
    }
    
    try {
      // Update the UI immediately with optimistic updates
      if (updateAssignmentOptimistically) {
        updateAssignmentOptimistically(officerId, null);
      }
      
      // Update the officer status to available
      await updateOfficer(officer.id, {
        ...officer,
        status: 'available',
        currentIncidentId: null
      });
      
      // Remove assignment
      await updateOfficerAssignment(officerId, null);
      
      // Trigger a refresh after assignment is updated
      refreshData();
      
      toast({
        title: "Officer returned to available",
        description: `${officer.name} is now available`,
      });
    } catch (error) {
      console.error("Failed to update officer status", error);
      toast({
        title: "Status update failed",
        description: "Failed to make officer available",
        variant: "destructive"
      });
    }
  }, [refreshData, updateOfficer, officers, updateAssignmentOptimistically, updateOfficerAssignment]);

  return { handleOfficerDropToList };
}
