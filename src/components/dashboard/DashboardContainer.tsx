
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/data';
import AssignmentGrid from './AssignmentGrid';
import OfficersSection from './OfficersSection';
import RecentIncidentsSection from './RecentIncidentsSection';
import OfficerDetailsDialog from './OfficerDetailsDialog';
import IncidentDetailsDialog from './IncidentDetailsDialog';
import { Officer, Incident } from '@/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const DashboardContainer: React.FC<{
  selectedOfficer: Officer | null;
  selectedIncident: Incident | null;
  setSelectedOfficer: (officer: Officer | null) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  officerAssignments: Record<string, string[]>;
  assignments: string[];
  allAssignedOfficerIds: string[];
  loading?: boolean;
  lastRefresh?: number;
  refreshData?: () => void;
  handleOfficerDrop: (e: React.DragEvent<HTMLDivElement>, assignmentId: string) => void;
  handleOfficerDragStartFromAssignment: (e: React.DragEvent<HTMLDivElement>, officer: Officer) => void;
  handleOfficerDropOnIncident: (e: React.DragEvent<HTMLDivElement>, incident: Incident) => void;
  handleOfficerDropToList?: (e: React.DragEvent<HTMLDivElement>) => void;
  canAssignOfficers?: boolean;
}> = ({
  selectedOfficer,
  selectedIncident,
  setSelectedOfficer,
  setSelectedIncident,
  officerAssignments,
  assignments,
  allAssignedOfficerIds,
  loading = false,
  lastRefresh,
  refreshData,
  handleOfficerDrop,
  handleOfficerDragStartFromAssignment,
  handleOfficerDropOnIncident,
  handleOfficerDropToList,
  canAssignOfficers = true,
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's what's happening today.
          </p>
        </div>
        
        {refreshData && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData} 
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        )}
      </div>
      
      {lastRefresh && (
        <div className="text-xs text-muted-foreground text-right">
          Last updated: {new Date(lastRefresh).toLocaleTimeString()}
        </div>
      )}
      
      <AssignmentGrid 
        assignments={assignments}
        officers={officers}
        officerAssignments={officerAssignments}
        onDrop={handleOfficerDrop}
        onOfficerDragStart={handleOfficerDragStartFromAssignment}
        canAssignOfficers={canAssignOfficers}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OfficersSection 
          officers={officers}
          assignedOfficerIds={allAssignedOfficerIds}
          onOfficerClick={setSelectedOfficer}
          onOfficerDrop={handleOfficerDropToList}
          canDragDrop={canAssignOfficers}
        />
        
        <RecentIncidentsSection 
          incidents={recentIncidents}
          onIncidentClick={setSelectedIncident}
          onOfficerDrop={handleOfficerDropOnIncident}
          canReceiveDrop={canAssignOfficers}
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
