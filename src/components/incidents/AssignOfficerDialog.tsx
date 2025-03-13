
import React, { useState } from 'react';
import { Officer } from '@/types';
import { Button } from '@/components/ui/button';
import { 
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

interface AssignOfficerDialogProps {
  availableOfficers: Officer[];
  onAssign: (officerId: string) => Promise<void>;
  onCancel: () => void;
}

const AssignOfficerDialog: React.FC<AssignOfficerDialogProps> = ({
  availableOfficers,
  onAssign,
  onCancel,
}) => {
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [assigningInProgress, setAssigningInProgress] = useState(false);
  
  const handleAssign = async () => {
    if (!selectedOfficerId) return;
    
    try {
      setAssigningInProgress(true);
      await onAssign(selectedOfficerId);
    } finally {
      setAssigningInProgress(false);
    }
  };
  
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Assign Officer to Incident</DialogTitle>
        <DialogDescription>
          Select an available officer to assign to this incident.
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4">
        {availableOfficers.length > 0 ? (
          <div className="space-y-4">
            <Select
              value={selectedOfficerId}
              onValueChange={setSelectedOfficerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an officer" />
              </SelectTrigger>
              <SelectContent>
                {availableOfficers.map(officer => (
                  <SelectItem key={officer.id} value={officer.id}>
                    {officer.name} - {officer.rank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No available officers at the moment
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          disabled={!selectedOfficerId || assigningInProgress}
        >
          {assigningInProgress ? 'Assigning...' : 'Assign'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AssignOfficerDialog;
