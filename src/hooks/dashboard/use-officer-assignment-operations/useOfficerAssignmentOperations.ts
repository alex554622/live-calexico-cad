
import { useCallback } from 'react';
import { Officer, Incident } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useOfficerAssignmentUpdate } from './useOfficerAssignmentUpdate';
import { useOfficerAssignmentToIncident } from './useOfficerAssignmentToIncident';
import { useOfficerListOperations } from './useOfficerListOperations';

/**
 * Main hook for officer assignment operations
 */
export function useOfficerAssignmentOperations(
  refreshData: () => void,
  updateOfficer: (officerId: string, updates: Partial<Officer>) => Promise<Officer>,
  officers: Officer[] = [],
  updateAssignmentOptimistically?: (officerId: string, assignmentId: string | null) => void
) {
  const { updateOfficerAssignment } = useOfficerAssignmentUpdate();
  
  // Get incident assignment operations
  const { handleOfficerDropOnIncident } = useOfficerAssignmentToIncident(
    refreshData,
    updateOfficer,
    officers,
    updateAssignmentOptimistically
  );
  
  // Get list operations
  const { handleOfficerDropToList } = useOfficerListOperations(
    refreshData,
    updateOfficer,
    officers,
    updateAssignmentOptimistically
  );
  
  // Handle dragging officer to an assignment
  const handleOfficerDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>, assignmentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const officerId = e.dataTransfer.getData("officerId");
    console.log(`Dropping officer ${officerId} to assignment ${assignmentId}`);
    
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
        updateAssignmentOptimistically(officerId, assignmentId);
      }
      
      // Update the officer status in the officers table
      await updateOfficer(officer.id, {
        ...officer,
        status: 'responding'
      });
      
      // Update the assignment in the officer_assignments table
      await updateOfficerAssignment(officerId, assignmentId);
      
      // Trigger a refresh after assignment is updated
      refreshData();
      
      toast({
        title: "Officer assigned",
        description: `${officer.name} has been assigned to ${assignmentId}`,
      });
    } catch (error) {
      console.error("Failed to update officer assignment", error);
      toast({
        title: "Assignment failed",
        description: "Failed to update officer assignment",
        variant: "destructive"
      });
    }
  }, [refreshData, updateOfficer, officers, updateAssignmentOptimistically, updateOfficerAssignment]);
  
  const handleOfficerDragStartFromAssignment = useCallback((e: React.DragEvent<HTMLDivElement>, officer: Officer) => {
    console.log(`Dragging officer ${officer.id} from assignment`);
    e.dataTransfer.setData("officerId", officer.id);
    e.dataTransfer.effectAllowed = "move";
  }, []);
  
  return {
    handleOfficerDrop,
    handleOfficerDragStartFromAssignment,
    handleOfficerDropOnIncident,
    handleOfficerDropToList
  };
}
