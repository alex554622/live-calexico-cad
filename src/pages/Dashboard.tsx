
import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Officer, Incident } from '@/types';
import { toast } from '@/components/ui/use-toast';

// Import our new components
import AssignmentGrid from '@/components/dashboard/AssignmentGrid';
import OfficersSection from '@/components/dashboard/OfficersSection';
import RecentIncidentsSection from '@/components/dashboard/RecentIncidentsSection';
import OfficerDetailsDialog from '@/components/dashboard/OfficerDetailsDialog';
import IncidentDetailsDialog from '@/components/dashboard/IncidentDetailsDialog';

const ASSIGNMENTS = [
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

const Dashboard = () => {
  const { officers, incidents, loadingOfficers, loadingIncidents, updateOfficer } = useData();
  const { user } = useAuth();
  
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [officerAssignments, setOfficerAssignments] = useState<Record<string, string[]>>({});
  
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
  
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
    .slice(0, 4);
  
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
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here's what's happening today.
        </p>
      </div>
      
      {loadingOfficers || loadingIncidents ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <AssignmentGrid 
            assignments={ASSIGNMENTS}
            officers={officers}
            officerAssignments={officerAssignments}
            onDrop={handleOfficerDrop}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OfficersSection 
              officers={officers}
              onOfficerClick={setSelectedOfficer}
            />
            
            <RecentIncidentsSection 
              incidents={recentIncidents}
              onIncidentClick={setSelectedIncident}
              onOfficerDrop={handleOfficerDropOnIncident}
            />
          </div>
        </>
      )}
      
      <OfficerDetailsDialog 
        officer={selectedOfficer}
        incidents={incidents}
        open={!!selectedOfficer}
        onOpenChange={(open) => {
          if (!open) setSelectedOfficer(null);
        }}
      />
      
      <IncidentDetailsDialog 
        incident={selectedIncident}
        officers={officers}
        open={!!selectedIncident}
        onOpenChange={(open) => {
          if (!open) setSelectedIncident(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
