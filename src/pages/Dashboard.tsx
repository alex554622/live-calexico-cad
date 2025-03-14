
import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import AssignmentBlock from '@/components/dashboard/AssignmentBlock';
import DraggableOfficerCard from '@/components/dashboard/DraggableOfficerCard';
import IncidentCard from '@/components/dashboard/IncidentCard';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Officer, Incident } from '@/types';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';
import IncidentPriorityBadge from '@/components/common/IncidentPriorityBadge';
import IncidentStatusBadge from '@/components/common/IncidentStatusBadge';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

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
  
  // Initialize assignments
  useEffect(() => {
    const initialAssignments: Record<string, string[]> = {};
    ASSIGNMENTS.forEach(assignment => {
      initialAssignments[assignment] = [];
    });
    
    // Group officers by current assignment if they have one
    officers.forEach(officer => {
      if (officer.currentIncidentId) {
        const incident = incidents.find(inc => inc.id === officer.currentIncidentId);
        if (incident) {
          // Try to match the location to an assignment
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
  
  // Filter to get most recent incidents
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
    .slice(0, 4);
  
  // Get officers for a specific assignment
  const getAssignmentOfficers = (assignment: string) => {
    const officerIds = officerAssignments[assignment] || [];
    return officers.filter(officer => officerIds.includes(officer.id));
  };
  
  // Handle dropping an officer onto an assignment
  const handleOfficerDrop = async (e: React.DragEvent<HTMLDivElement>, assignmentId: string) => {
    e.preventDefault();
    const officerId = e.dataTransfer.getData("officerId");
    if (!officerId) return;
    
    // Remove officer from any previous assignment
    const updatedAssignments = { ...officerAssignments };
    
    Object.keys(updatedAssignments).forEach(assignment => {
      updatedAssignments[assignment] = updatedAssignments[assignment].filter(
        id => id !== officerId
      );
    });
    
    // Add officer to the new assignment
    updatedAssignments[assignmentId] = [
      ...updatedAssignments[assignmentId],
      officerId
    ];
    
    setOfficerAssignments(updatedAssignments);
    
    // Update officer status to 'responding'
    const officer = officers.find(o => o.id === officerId);
    if (officer) {
      try {
        // In a real application, you would update the officer's status and location
        // based on the assignment. For now, we're just updating the status.
        await updateOfficer({
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
          {/* Assignment Blocks */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Assignments</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {ASSIGNMENTS.map((assignment) => (
                <AssignmentBlock
                  key={assignment}
                  title={assignment}
                  officers={getAssignmentOfficers(assignment)}
                  onDrop={handleOfficerDrop}
                />
              ))}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Officers Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Officers</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {officers.slice(0, 6).map((officer) => (
                  <DraggableOfficerCard 
                    key={officer.id} 
                    officer={officer} 
                    onClick={() => setSelectedOfficer(officer)}
                  />
                ))}
              </div>
            </div>
            
            {/* Incidents Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Incidents</h2>
              </div>
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <IncidentCard 
                    key={incident.id} 
                    incident={incident} 
                    onClick={() => setSelectedIncident(incident)}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Officer Details Dialog */}
      <Dialog open={!!selectedOfficer} onOpenChange={(open) => !open && setSelectedOfficer(null)}>
        {selectedOfficer && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Officer Details</DialogTitle>
              <DialogDescription>
                Information about {selectedOfficer.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-police text-white flex items-center justify-center font-bold text-lg">
                  {selectedOfficer.name.split(' ')[0][0] + (selectedOfficer.name.split(' ')[1]?.[0] || '')}
                </div>
                <div>
                  <h3 className="font-medium">{selectedOfficer.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedOfficer.rank}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Badge Number</p>
                  <p className="text-sm">{selectedOfficer.badgeNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-sm">{selectedOfficer.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <OfficerStatusBadge status={selectedOfficer.status} />
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm">{format(new Date(selectedOfficer.lastUpdated), 'h:mm a')}</p>
                </div>
              </div>
              
              {selectedOfficer.currentIncidentId && (
                <div>
                  <p className="text-sm font-medium">Current Incident</p>
                  <p className="text-sm">{
                    incidents.find(i => i.id === selectedOfficer.currentIncidentId)?.title || 'Unknown'
                  }</p>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Incident Details Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
        {selectedIncident && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedIncident.title}</DialogTitle>
              <div className="flex space-x-2 mt-2">
                <IncidentPriorityBadge priority={selectedIncident.priority} />
                <IncidentStatusBadge status={selectedIncident.status} />
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="officers">Assigned Officers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 py-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm">{selectedIncident.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Location</h3>
                  <p className="text-sm">{selectedIncident.location.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Reported At</h3>
                    <p className="text-sm">{format(new Date(selectedIncident.reportedAt), 'MMM d, h:mm a')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                    <p className="text-sm">{format(new Date(selectedIncident.updatedAt), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="officers">
                {selectedIncident.assignedOfficers.length > 0 ? (
                  <div className="space-y-3 py-4">
                    {selectedIncident.assignedOfficers.map(officerId => {
                      const officer = officers.find(o => o.id === officerId);
                      if (!officer) return null;
                      
                      return (
                        <div key={officer.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div>
                            <p className="font-medium">{officer.name}</p>
                            <p className="text-sm text-muted-foreground">{officer.rank}</p>
                          </div>
                          <OfficerStatusBadge status={officer.status} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    No officers assigned to this incident
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Dashboard;
