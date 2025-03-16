
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for updating officer assignments in the database
 */
export function useOfficerAssignmentUpdate() {
  // Helper method to update an officer's assignment in Supabase
  const updateOfficerAssignment = async (officerId: string, assignmentName: string | null) => {
    try {
      console.log(`Updating officer ${officerId} assignment to ${assignmentName}`);
      
      // First check if the officer already has an assignment
      const { data, error } = await supabase
        .from('officer_assignments')
        .select('*')
        .eq('officer_id', officerId);
        
      if (error) {
        console.error('Error checking officer assignment:', error);
        throw error;
      }
      
      if (assignmentName === null) {
        // Remove assignment if we're setting to null (dragging back to officers list)
        if (data && data.length > 0) {
          console.log(`Removing assignment for officer ${officerId}`);
          
          const { error: deleteError } = await supabase
            .from('officer_assignments')
            .delete()
            .eq('officer_id', officerId);
            
          if (deleteError) {
            console.error('Error deleting officer assignment:', deleteError);
            throw deleteError;
          }
        }
      } else if (data && data.length > 0) {
        // Update existing assignment
        console.log(`Updating existing assignment for officer ${officerId} to ${assignmentName}`);
        
        const { error: updateError } = await supabase
          .from('officer_assignments')
          .update({ assignment_name: assignmentName, assigned_at: new Date().toISOString() })
          .eq('officer_id', officerId);
          
        if (updateError) {
          console.error('Error updating officer assignment:', updateError);
          throw updateError;
        }
      } else {
        // Create new assignment
        console.log(`Creating new assignment for officer ${officerId} to ${assignmentName}`);
        
        const { error: insertError } = await supabase
          .from('officer_assignments')
          .insert({
            officer_id: officerId,
            assignment_name: assignmentName
          });
          
        if (insertError) {
          console.error('Error creating officer assignment:', insertError);
          throw insertError;
        }
      }
    } catch (error) {
      console.error('Error updating officer assignment:', error);
      throw error;
    }
  };

  return { updateOfficerAssignment };
}
