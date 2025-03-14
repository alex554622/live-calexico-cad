
import { useState, useEffect, useCallback } from 'react';
import { useData } from '@/context/data';
import { Officer, Incident } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ASSIGNMENTS = [
  "2nd St & Chavez",
  "Imperial & 5th St",
  "Imperial & 7th St",
  "Imperial & Grant St",
  "Imperial & 98",
  "Chavez & Grant",
  "UP/DOWN",
  "ENF 2 HRS",
  "ENF METERS",
  "Beats Patrol"
];

export function useDashboard() {
  const { officers, incidents, updateOfficer } = useData();
  
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
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
  
  // Initial fetch of assignments and setup for real-time updates
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
  
  // Helper method to update an officer's assignment in Supabase
  const updateOfficerAssignment = async (officerId: string, assignmentName: string) => {
    try {
      // First check if the officer already has an assignment
      const { data, error } = await supabase
        .from('officer_assignments')
        .select('*')
        .eq('officer_id', officerId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
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
  const handleOfficerDrop = async (e: React.DragEvent<HTMLDivElement>, assignmentId: string) => {
    e.preventDefault();
    const officerId = e.dataTransfer.getData("officerId");
    if (!officerId) return;
    
    const officer = officers.find(o => o.id === officerId);
    if (!officer) return;
    
    try {
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
      
      // Trigger refresh
      refreshData();
    } catch (error) {
      console.error("Failed to update officer assignment", error);
      toast({
        title: "Assignment failed",
        description: "Failed to update officer assignment",
        variant: "destructive"
      });
    }
  };
  
  const handleOfficerDragStartFromAssignment = (e: React.DragEvent<HTMLDivElement>, officer: Officer) => {
    e.dataTransfer.setData("officerId", officer.id);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleOfficerDropOnIncident = async (e: React.DragEvent<HTMLDivElement>, incident: Incident) => {
    e.preventDefault();
    const officerId = e.dataTransfer.getData("officerId");
    if (!officerId) return;
    
    const officer = officers.find(o => o.id === officerId);
    if (officer) {
      try {
        // Update officer in the officers table
        await updateOfficer(officer.id, {
          ...officer,
          status: 'responding',
          currentIncidentId: incident.id
        });
        
        // Check if there's a matching assignment for this incident
        const matchedAssignment = ASSIGNMENTS.find(
          assignment => incident.location.address.includes(assignment)
        );
        
        if (matchedAssignment) {
          // Update officer assignment in the officer_assignments table
          await updateOfficerAssignment(officerId, matchedAssignment);
        }
        
        toast({
          title: "Officer assigned to incident",
          description: `${officer.name} has been assigned to "${incident.title}"`,
        });
        
        // Trigger refresh
        refreshData();
      } catch (error) {
        console.error("Failed to assign officer to incident", error);
        toast({
          title: "Assignment failed",
          description: "Failed to assign officer to incident",
          variant: "destructive"
        });
      }
    }
  };

  return {
    selectedOfficer,
    setSelectedOfficer,
    selectedIncident,
    setSelectedIncident,
    officerAssignments,
    allAssignedOfficerIds,
    loading,
    lastRefresh,
    refreshData,
    handleOfficerDrop,
    handleOfficerDragStartFromAssignment,
    handleOfficerDropOnIncident
  };
}
