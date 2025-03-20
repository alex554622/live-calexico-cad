
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ScheduleForm } from './ScheduleForm';

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddScheduleDialog = ({ open, onOpenChange }: AddScheduleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Schedule</DialogTitle>
          <DialogDescription>
            Create a new work schedule for an employee.
          </DialogDescription>
        </DialogHeader>
        
        <ScheduleForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};
