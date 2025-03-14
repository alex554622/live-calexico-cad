
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/data';
import AssignmentGrid from './AssignmentGrid';
import OfficersSection from './OfficersSection';
import RecentIncidentsSection from './RecentIncidentsSection';
import OfficerDetailsDialog from './OfficerDetailsDialog';
import IncidentDetailsDialog from './IncidentDetailsDialog';
import { Officer, Incident } from '@/types';

const DashboardContainer: React.FC<{
  selectedOfficer: Officer | null;
  selectedIncident: Incident | null;
  setSelectedOfficer: (officer: Officer | null) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  officerAssignments: Record<string, string[]>;
  assignments: string[];
  allAssignedOfficerIds: string[];
  loading?: boolean;
  handleOfficerDrop: (e: React.DragEvent<HTMLDivElement>, assignmentId: string) => void;
  handleOfficerDragStartFromAssignment: (e: React.DragEvent<HTMLDivElement>, officer: Officer) => void;
  handleOfficerDropOnIncident: (e: React.DragEvent<HTMLDivElement>, incident: Incident) => void;
}> = ({
  selectedOfficer,
  selectedIncident,
  setSelectedOfficer,
  setSelectedIncident,
  officerAssignments,
  assignments,
  allAssignedOfficerIds,
  loading = false,
  handleOfficerDrop,
  handleOfficerDragStartFromAssignment,
  handleOfficerDropOnIncident,
}) => {
  const { officers, incidents, loadingOfficers, loadingIncidents } = useData();
  const { user } = useAuth();
  
  // Sort incidents by date (most recent first)
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
    .slice(0, 4);
  
  if (loadingOfficers || loadingIncidents || loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p>Loading dashboard data...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here's what's happening today.
        </p>
      </div>
      
      <AssignmentGrid 
        assignments={assignments}
        officers={officers}
        officerAssignments={officerAssignments}
        onDrop={handleOfficerDrop}
        onOfficerDragStart={handleOfficerDragStartFromAssignment}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OfficersSection 
          officers={officers}
          assignedOfficerIds={allAssignedOfficerIds}
          onOfficerClick={setSelectedOfficer}
        />
        
        <RecentIncidentsSection 
          incidents={recentIncidents}
          onIncidentClick={setSelectedIncident}
          onOfficerDrop={handleOfficerDropOnIncident}
        />
      </div>
      
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

export default DashboardContainer;
