
import { useCallback } from 'react';
import { Officer, Incident } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { ASSIGNMENTS } from '../constants';
import { useOfficerAssignmentUpdate } from './useOfficerAssignmentUpdate';

/**
 * Hook for handling when officers are assigned to incidents
 */
export function useOfficerAssignmentToIncident(
  refreshData: () => void,
  updateOfficer: (officerId: string, updates: Partial<Officer>) => Promise<Officer>,
  officers: Officer[] = [],
  updateAssignmentOptimistically?: (officerId: string, assignmentId: string | null) => void
) {
  const { updateOfficerAssignment } = useOfficerAssignmentUpdate();

  const handleOfficerDropOnIncident = useCallback(async (e: React.DragEvent<HTMLDivElement>, incident: Incident) => {
    e.preventDefault();
    e.stopPropagation();
    const officerId = e.dataTransfer.getData("officerId");
    console.log(`Dropping officer ${officerId} on incident ${incident.id}`);
    
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
        
        // Trigger a refresh after assignment is updated
        refreshData();
        
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
  }, [refreshData, updateOfficer, officers, updateAssignmentOptimistically, updateOfficerAssignment]);

  return { handleOfficerDropOnIncident };
}
