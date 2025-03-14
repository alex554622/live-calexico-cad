
import { useState, useEffect } from 'react';
import { useData } from '@/context/data';
import { Officer, Incident } from '@/types';
import { toast } from '@/components/ui/use-toast';

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
  
  // Get all assigned officer IDs across all assignments
  const allAssignedOfficerIds = Object.values(officerAssignments).flat();
  
  useEffect(() => {
    const initialAssignments: Record<string, string[]> = {};
    ASSIGNMENTS.forEach(assignment => {
      initialAssignments[assignment] = [];
    });
    
    officers.forEach(officer => {
      if (officer.currentIncidentId) {
        const incident = incidents.find(inc => inc.id === officer.currentIncidentId);
        if (incident) {
          const matchedAssignment = ASSIGNMENTS.find(
            assignment => incident.location.address.includes(assignment)
          );
          
          if (matchedAssignment) {
            initialAssignments[matchedAssignment] = [
              ...initialAssignments[matchedAssignment],
              officer.id
            ];
          }
        }
      }
    });
    
    setOfficerAssignments(initialAssignments);
  }, [officers, incidents]);
  
  const handleOfficerDrop = async (e: React.DragEvent<HTMLDivElement>, assignmentId: string) => {
    e.preventDefault();
    const officerId = e.dataTransfer.getData("officerId");
    if (!officerId) return;
    
    const officer = officers.find(o => o.id === officerId);
    if (!officer) return;
    
    const updatedAssignments = { ...officerAssignments };
    
    Object.keys(updatedAssignments).forEach(assignment => {
      updatedAssignments[assignment] = updatedAssignments[assignment].filter(
        id => id !== officerId
      );
    });
    
    updatedAssignments[assignmentId] = [
      ...updatedAssignments[assignmentId],
      officerId
    ];
    
    setOfficerAssignments(updatedAssignments);
    
    try {
      await updateOfficer(officer.id, {
        ...officer,
        status: 'responding'
      });
      
      toast({
        title: "Officer assigned",
        description: `${officer.name} has been assigned to ${assignmentId}`,
      });
    } catch (error) {
      console.error("Failed to update officer status", error);
      toast({
        title: "Assignment failed",
        description: "Failed to update officer status",
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
        await updateOfficer(officer.id, {
          ...officer,
          status: 'responding',
          currentIncidentId: incident.id
        });
        
        const matchedAssignment = ASSIGNMENTS.find(
          assignment => incident.location.address.includes(assignment)
        );
        
        if (matchedAssignment) {
          const updatedAssignments = { ...officerAssignments };
          
          Object.keys(updatedAssignments).forEach(assignment => {
            updatedAssignments[assignment] = updatedAssignments[assignment].filter(
              id => id !== officerId
            );
          });
          
          updatedAssignments[matchedAssignment] = [
            ...updatedAssignments[matchedAssignment],
            officerId
          ];
          
          setOfficerAssignments(updatedAssignments);
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
  };

  return {
    selectedOfficer,
    setSelectedOfficer,
    selectedIncident,
    setSelectedIncident,
    officerAssignments,
    setOfficerAssignments,
    allAssignedOfficerIds,
    handleOfficerDrop,
    handleOfficerDragStartFromAssignment,
    handleOfficerDropOnIncident
  };
}
