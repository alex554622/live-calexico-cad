
import React from 'react';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';
import { useData } from '@/context/data';
import { useAuth } from '@/context/AuthContext';
import { Officer } from '@/types';
import { Button } from '@/components/ui/button';
import OfficerFilters from '@/components/officers/OfficerFilters';
import OfficerCardGrid from '@/components/officers/OfficerCardGrid';
import OfficerDialogs from '@/components/officers/OfficerDialogs';
import { useOfficerSelection } from '@/hooks/use-officer-selection';
import { useOfficerStatusUpdate } from '@/hooks/use-officer-status-update';
import { useOfficerOperations } from '@/hooks/use-officer-operations';
import { useOfficerPage } from '@/hooks/use-officer-page';

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

  const {
    getOfficerIncident,
    handleUpdateStatus,
    handleDeleteSelectedConfirm,
    handleSingleOfficerDelete
  } = useOfficerPage({
    incidents,
    selectedOfficer,
    setSelectedOfficer,
    handleUpdateOfficerStatus,
    handleDeleteSelected,
    handleDeleteOfficer,
    selectedOfficers,
    setSelectedOfficers,
    setIsSelectionMode
  });

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

      <OfficerCardGrid
        loadingOfficers={loadingOfficers}
        filteredOfficers={filteredOfficers}
        isSelectionMode={isSelectionMode}
        selectedOfficers={selectedOfficers}
        toggleOfficerSelection={toggleOfficerSelection}
        setSelectedOfficer={setSelectedOfficer}
        openStatusUpdateDialog={openStatusUpdateDialog}
        getOfficerIncident={getOfficerIncident}
        hasEditPermission={hasPermission('editOfficer')}
      />

      <OfficerDialogs
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        selectedOfficer={selectedOfficer}
        setSelectedOfficer={setSelectedOfficer}
        incidents={incidents}
        isUpdatingStatus={isUpdatingStatus}
        setIsUpdatingStatus={setIsUpdatingStatus}
        statusUpdateOfficer={statusUpdateOfficer}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        isConfirmingDelete={isConfirmingDelete}
        setIsConfirmingDelete={setIsConfirmingDelete}
        selectedOfficersCount={selectedOfficers.length}
        handleCreateSuccess={handleCreateSuccess}
        handleUpdateStatus={handleUpdateStatus}
        handleDeleteSelectedConfirm={handleDeleteSelectedConfirm}
        handleSingleOfficerDelete={handleSingleOfficerDelete}
        hasEditPermission={hasPermission('editOfficer')}
        hasDeletePermission={hasPermission('deleteOfficer')}
      />
    </div>
  );
};

export default Officers;
