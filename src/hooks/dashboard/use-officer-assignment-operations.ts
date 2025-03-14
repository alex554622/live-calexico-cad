
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Officer, Incident } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { ASSIGNMENTS } from './constants';

/**
 * Hook for officer assignment operations
 */
export function useOfficerAssignmentOperations(
  refreshData: () => void,
  updateOfficer: (officerId: string, updates: Partial<Officer>) => Promise<Officer>,
  officers: Officer[] = [],
  updateAssignmentOptimistically?: (officerId: string, assignmentId: string | null) => void
) {
  // Helper method to update an officer's assignment in Supabase
  const updateOfficerAssignment = async (officerId: string, assignmentName: string | null) => {
    try {
      // First check if the officer already has an assignment
      const { data, error } = await supabase
        .from('officer_assignments')
        .select('*')
        .eq('officer_id', officerId);
        
      if (error) throw error;
      
      if (assignmentName === null) {
        // Remove assignment if we're setting to null (dragging back to officers list)
        if (data && data.length > 0) {
          const { error: deleteError } = await supabase
            .from('officer_assignments')
            .delete()
            .eq('officer_id', officerId);
            
          if (deleteError) throw deleteError;
        }
      } else if (data && data.length > 0) {
        // Update existing assignment
        const { error: updateError } = await supabase
          .from('officer_assignments')
          .update({ assignment_name: assignmentName, assigned_at: new Date().toISOString() })
          .eq('officer_id', officerId);
          
        if (updateError) throw updateError;
      } else {
        // Create new assignment
        const { error: insertError } = await supabase
          .from('officer_assignments')
          .insert({
            officer_id: officerId,
            assignment_name: assignmentName
          });
          
        if (insertError) throw insertError;
      }
      
      // Trigger a refresh after assignment is updated
      refreshData();
    } catch (error) {
      console.error('Error updating officer assignment:', error);
      throw error;
    }
  };
  
  // Handle dragging officer to an assignment
  const handleOfficerDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>, assignmentId: string) => {
    e.preventDefault();
    const officerId = e.dataTransfer.getData("officerId");
    if (!officerId) return;
    
    const officer = officers.find(o => o.id === officerId);
    if (!officer) return;
    
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
  }, [refreshData, updateOfficer, officers, updateAssignmentOptimistically]);
  
  const handleOfficerDragStartFromAssignment = useCallback((e: React.DragEvent<HTMLDivElement>, officer: Officer) => {
    e.dataTransfer.setData("officerId", officer.id);
    e.dataTransfer.effectAllowed = "move";
  }, []);
  
  // Handle dragging officer back to officer list
  const handleOfficerDropToList = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const officerId = e.dataTransfer.getData("officerId");
    if (!officerId) return;
    
    const officer = officers.find(o => o.id === officerId);
    if (!officer) return;
    
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
  }, [refreshData, updateOfficer, officers, updateAssignmentOptimistically]);
  
  const handleOfficerDropOnIncident = useCallback(async (e: React.DragEvent<HTMLDivElement>, incident: Incident) => {
    e.preventDefault();
    const officerId = e.dataTransfer.getData("officerId");
    if (!officerId) return;
    
    const officer = officers.find(o => o.id === officerId);
    if (officer) {
      try {
        // Check if there's a matching assignment for this incident
        const matchedAssignment = ASSIGNMENTS.find(
          assignment => incident.location.address.includes(assignment)
        );
        
        // Update the UI immediately with optimistic updates
        if (updateAssignmentOptimistically && matchedAssignment) {
          updateAssignmentOptimistically(officerId, matchedAssignment);
        }
        
        // Update officer in the officers table
        await updateOfficer(officer.id, {
          ...officer,
          status: 'responding',
          currentIncidentId: incident.id
        });
        
        if (matchedAssignment) {
          // Update officer assignment in the officer_assignments table
          await updateOfficerAssignment(officerId, matchedAssignment);
        }
        
        toast({
          title: "Officer assigned to incident",
          description: `${officer.name} has been assigned to "${incident.title}"`,
        });
      } catch (error) {
        console.error("Failed to assign officer to incident", error);
        toast({
          title: "Assignment failed",
          description: "Failed to assign officer to incident",
          variant: "destructive"
        });
      }
    }
  }, [refreshData, updateOfficer, officers, updateAssignmentOptimistically]);

  return {
    handleOfficerDrop,
    handleOfficerDragStartFromAssignment,
    handleOfficerDropOnIncident,
    handleOfficerDropToList
  };
}
