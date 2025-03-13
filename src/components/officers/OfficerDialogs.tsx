import React from 'react';
import { Officer, Incident, OfficerStatus } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import OfficerForm from './OfficerForm';
import OfficerDetailDialog from './OfficerDetailDialog';
import StatusUpdateDialog from './StatusUpdateDialog';
import DeleteOfficersDialog from './DeleteOfficersDialog';

interface OfficerDialogsProps {
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  selectedOfficer: Officer | null;
  setSelectedOfficer: (officer: Officer | null) => void;
  incidents: Incident[];
  isUpdatingStatus: boolean;
  setIsUpdatingStatus: (value: boolean) => void;
  statusUpdateOfficer: Officer | null;
  newStatus: OfficerStatus;
  setNewStatus: (status: OfficerStatus) => void;
  isConfirmingDelete: boolean;
  setIsConfirmingDelete: (value: boolean) => void;
  selectedOfficersCount: number;
  handleCreateSuccess: (officer: Officer) => Officer;
  handleUpdateStatus: () => Promise<void>;
  handleDeleteSelectedConfirm: () => Promise<void>;
  handleSingleOfficerDelete: (officerId: string) => Promise<void>;
  hasEditPermission: boolean;
  hasDeletePermission: boolean;
}

const OfficerDialogs: React.FC<OfficerDialogsProps> = ({
  isCreating,
  setIsCreating,
  selectedOfficer,
  setSelectedOfficer,
  incidents,
  isUpdatingStatus,
  setIsUpdatingStatus,
  statusUpdateOfficer,
  newStatus,
  setNewStatus,
  isConfirmingDelete,
  setIsConfirmingDelete,
  selectedOfficersCount,
  handleCreateSuccess,
  handleUpdateStatus,
  handleDeleteSelectedConfirm,
  handleSingleOfficerDelete,
  hasEditPermission,
  hasDeletePermission
}) => {
  return (
    <>
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
        hasEditPermission={hasEditPermission}
        hasDeletePermission={hasDeletePermission}
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
        selectedCount={selectedOfficersCount}
        onDelete={handleDeleteSelectedConfirm}
      />
    </>
  );
};

export default OfficerDialogs;
