
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface DeleteIncidentsDialogProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteIncidentsDialog: React.FC<DeleteIncidentsDialogProps> = ({
  count,
  onConfirm,
  onCancel,
}) => {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {count} selected incident(s)? 
          This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeleteIncidentsDialog;
