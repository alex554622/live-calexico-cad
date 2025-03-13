
import React from 'react';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import OfficerForm from '@/components/officers/OfficerForm';
import OfficerFilters from '@/components/officers/OfficerFilters';
import OfficerCard from '@/components/officers/OfficerCard';
import OfficerDetailDialog from '@/components/officers/OfficerDetailDialog';
import StatusUpdateDialog from '@/components/officers/StatusUpdateDialog';
import DeleteOfficersDialog from '@/components/officers/DeleteOfficersDialog';
import { useOfficerSelection } from '@/hooks/use-officer-selection';
import { useOfficerStatusUpdate } from '@/hooks/use-officer-status-update';
import { useOfficerOperations } from '@/hooks/use-officer-operations';

const Officers = () => {
  const { officers, incidents, loadingOfficers } = useData();
  const { hasPermission } = useAuth();

  // Hooks for officer management
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    rankFilter,
    setRankFilter,
    selectedOfficers,
    setSelectedOfficers,
    isSelectionMode,
    setIsSelectionMode,
    selectedOfficer,
    setSelectedOfficer,
    uniqueRanks,
    filteredOfficers,
    toggleSelectionMode,
    toggleOfficerSelection
  } = useOfficerSelection(officers);

  const {
    isUpdatingStatus,
    setIsUpdatingStatus,
    statusUpdateOfficer,
    newStatus,
    setNewStatus,
    openStatusUpdateDialog,
    handleUpdateOfficerStatus
  } = useOfficerStatusUpdate();

  const {
    isCreating,
    setIsCreating,
    isConfirmingDelete,
    setIsConfirmingDelete,
    handleCreateSuccess,
    handleDeleteSelected,
    handleDeleteOfficer
  } = useOfficerOperations();

  // Helper functions
  const getOfficerIncident = (officer: Officer) => {
    if (!officer.currentIncidentId) return null;
    return incidents.find(incident => incident.id === officer.currentIncidentId);
  };

  const handleUpdateStatus = async () => {
    const updatedOfficer = await handleUpdateOfficerStatus();
    
    if (updatedOfficer && selectedOfficer && selectedOfficer.id === updatedOfficer.id) {
      setSelectedOfficer(updatedOfficer);
    }
  };

  const handleDeleteSelectedConfirm = async () => {
    const success = await handleDeleteSelected(selectedOfficers);
    if (success) {
      setSelectedOfficers([]);
      setIsSelectionMode(false);
    }
  };

  const handleSingleOfficerDelete = async (officerId: string) => {
    const success = await handleDeleteOfficer(officerId);
    if (success) {
      setSelectedOfficer(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Officers</h1>
          <p className="text-muted-foreground">
            View and manage all officers in the system.
          </p>
        </div>
        <div className="flex gap-2">
          {hasPermission('createOfficer') && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-1" /> New Officer
            </Button>
          )}
          {hasPermission('editOfficer') && (
            <Button 
              variant={isSelectionMode ? "secondary" : "outline"} 
              onClick={toggleSelectionMode}
            >
              <CheckSquare className="h-4 w-4 mr-1" /> 
              {isSelectionMode ? "Cancel Selection" : "Select Officers"}
            </Button>
          )}
          {isSelectionMode && selectedOfficers.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
            </Button>
          )}
        </div>
      </div>

      <OfficerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        rankFilter={rankFilter}
        onRankFilterChange={setRankFilter}
        uniqueRanks={uniqueRanks}
      />

      {loadingOfficers ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <p>Loading officers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOfficers.map(officer => (
            <OfficerCard
              key={officer.id}
              officer={officer}
              isSelectionMode={isSelectionMode}
              isSelected={selectedOfficers.includes(officer.id)}
              onSelect={toggleOfficerSelection}
              onClick={() => setSelectedOfficer(officer)}
              onStatusUpdate={openStatusUpdateDialog}
              currentIncident={getOfficerIncident(officer)}
              hasEditPermission={hasPermission('editOfficer')}
            />
          ))}
        </div>
      )}

      {/* Create Officer Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Officer</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new officer to the system.
            </DialogDescription>
          </DialogHeader>
          
          <OfficerForm 
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Officer Detail Dialog */}
      <OfficerDetailDialog
        officer={selectedOfficer}
        incidents={incidents}
        isOpen={!!selectedOfficer}
        onOpenChange={(open) => !open && setSelectedOfficer(null)}
        onDelete={handleSingleOfficerDelete}
        hasEditPermission={hasPermission('editOfficer')}
        hasDeletePermission={hasPermission('deleteOfficer')}
      />

      {/* Status Update Dialog */}
      <StatusUpdateDialog
        isOpen={isUpdatingStatus}
        onOpenChange={setIsUpdatingStatus}
        officer={statusUpdateOfficer}
        status={newStatus}
        onStatusChange={setNewStatus}
        onSubmit={handleUpdateStatus}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteOfficersDialog
        isOpen={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        selectedCount={selectedOfficers.length}
        onDelete={handleDeleteSelectedConfirm}
      />
    </div>
  );
};

export default Officers;
