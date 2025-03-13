
import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Incident } from '@/types';
import { 
  Dialog,
  DialogContent
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useIncidentFilters } from '@/hooks/use-incident-filters';
import { useIncidentSelection } from '@/hooks/use-incident-selection';

// Import the refactored components
import IncidentHeader from '@/components/incidents/IncidentHeader';
import IncidentSearch from '@/components/incidents/IncidentSearch';
import IncidentList from '@/components/incidents/IncidentList';
import IncidentForm from '@/components/incidents/IncidentForm';
import IncidentDetailView from '@/components/incidents/IncidentDetailView';
import AssignOfficerDialog from '@/components/incidents/AssignOfficerDialog';
import DeleteIncidentsDialog from '@/components/incidents/DeleteIncidentsDialog';

const Incidents = () => {
  const { incidents, officers, loadingIncidents, loadingOfficers, assignOfficerToIncident, updateIncident, deleteIncident } = useData();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Custom hooks
  const { 
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    priorityFilter, setPriorityFilter,
    filteredIncidents 
  } = useIncidentFilters(incidents);
  
  const {
    selectedIncidents,
    setSelectedIncidents,
    isSelectionMode,
    setIsSelectionMode,
    toggleSelectionMode,
    toggleIncidentSelection
  } = useIncidentSelection();

  useEffect(() => {
    const checkDataRetention = () => {
      const dataRetention = parseInt(localStorage.getItem('dataRetention') || '5');
      const now = new Date();
      
      const outdatedIncidents = incidents.filter(incident => {
        const reportedAt = new Date(incident.reportedAt);
        const daysDifference = Math.floor((now.getTime() - reportedAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysDifference > dataRetention;
      });

      if (outdatedIncidents.length > 0) {
        toast({
          title: 'Data Retention Notice',
          description: `${outdatedIncidents.length} incident(s) are older than ${dataRetention} days and will be deleted soon.`,
          variant: 'destructive',
        });
      }
    };

    checkDataRetention();
  }, [incidents, toast]);

  const handleCreateSuccess = (newIncident: Incident) => {
    setIsCreating(false);
    setSelectedIncident(newIncident);
  };

  const handleEditSuccess = (updatedIncident: Incident) => {
    setSelectedIncident(updatedIncident);
  };

  const handleAssignOfficer = async (officerId: string) => {
    if (!selectedIncident) return;
    
    try {
      await assignOfficerToIncident(selectedIncident.id, officerId);
      
      toast({
        title: 'Officer Assigned',
        description: 'Officer has been successfully assigned to the incident',
      });
      
      setIsAssigning(false);
    } catch (error) {
      console.error('Error assigning officer:', error);
      toast({
        title: 'Assignment Failed',
        description: 'Failed to assign officer to the incident',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedIncidents) {
        await deleteIncident(id);
      }
      
      toast({
        title: 'Incidents Deleted',
        description: `${selectedIncidents.length} incident(s) have been deleted`,
      });
      
      setSelectedIncidents([]);
      setIsSelectionMode(false);
      setIsConfirmingDelete(false);
    } catch (error) {
      console.error('Error deleting incidents:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete selected incidents',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    try {
      await deleteIncident(incidentId);
      
      toast({
        title: 'Incident Deleted',
        description: `Incident has been deleted successfully`,
      });
      
      setSelectedIncident(null);
    } catch (error) {
      console.error('Error deleting incident:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete incident',
        variant: 'destructive',
      });
    }
  };

  const availableOfficers = officers.filter(officer => 
    (officer.status === 'available' || !officer.currentIncidentId) && 
    officer.status !== 'offDuty'
  );

  return (
    <div className="space-y-6">
      <IncidentHeader 
        hasCreatePermission={hasPermission('createIncident')}
        hasEditPermission={hasPermission('editIncident')}
        isSelectionMode={isSelectionMode}
        selectedCount={selectedIncidents.length}
        onCreateNew={() => setIsCreating(true)}
        onToggleSelectionMode={toggleSelectionMode}
        onDeleteSelected={() => setIsConfirmingDelete(true)}
      />

      <IncidentSearch 
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        setSearchTerm={setSearchTerm}
        setStatusFilter={setStatusFilter}
        setPriorityFilter={setPriorityFilter}
      />

      {loadingIncidents ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <p>Loading incidents...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <IncidentList 
            incidents={filteredIncidents}
            isSelectionMode={isSelectionMode}
            selectedIncidents={selectedIncidents}
            toggleIncidentSelection={toggleIncidentSelection}
            onSelectIncident={setSelectedIncident}
          />
        </div>
      )}

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[600px]">
          <div>
            <h2 className="text-lg font-semibold mb-2">Create New Incident</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Fill in the details below to report a new incident.
            </p>
          </div>
          
          <IncidentForm 
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
        {selectedIncident && (
          <DialogContent className="sm:max-w-[600px]">
            <IncidentDetailView 
              incident={selectedIncident}
              officers={officers}
              loadingOfficers={loadingOfficers}
              onEdit={handleEditSuccess}
              onDelete={handleDeleteIncident}
              onAssignOfficer={() => setIsAssigning(true)}
            />
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={isAssigning} onOpenChange={setIsAssigning}>
        <AssignOfficerDialog 
          availableOfficers={availableOfficers}
          onAssign={handleAssignOfficer}
          onCancel={() => setIsAssigning(false)}
        />
      </Dialog>

      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DeleteIncidentsDialog 
          count={selectedIncidents.length}
          onConfirm={handleDeleteSelected}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      </Dialog>
    </div>
  );
};

export default Incidents;
