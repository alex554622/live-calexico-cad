
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Officer, OfficerStatus } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  officer: Officer | null;
  status: OfficerStatus;
  onStatusChange: (value: OfficerStatus) => void;
  onSubmit: () => void;
}

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  isOpen,
  onOpenChange,
  officer,
  status,
  onStatusChange,
  onSubmit
}) => {
  if (!officer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Officer Status</DialogTitle>
          <DialogDescription>
            Change the status of {officer.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select
            value={status}
            onValueChange={(value) => onStatusChange(value as OfficerStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="responding">Responding</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="offDuty">Off Duty</SelectItem>
            </SelectContent>
          </Select>
          
          {status === 'responding' && !officer.currentIncidentId && (
            <div className="mt-4 p-3 border rounded-md bg-amber-50 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                This officer is not assigned to any incident. They will be marked as responding, 
                but without an incident assignment.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            variant={status === 'available' ? 'success' : 
                    status === 'responding' ? 'info' : 
                    status === 'busy' ? 'warning' : 'secondary'}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateDialog;
