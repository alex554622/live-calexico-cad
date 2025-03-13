
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Officer, OfficerStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useOfficerStatusUpdate() {
  const { updateOfficerStatus } = useData();
  const { toast } = useToast();
  
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateOfficer, setStatusUpdateOfficer] = useState<Officer | null>(null);
  const [newStatus, setNewStatus] = useState<OfficerStatus>('available');

  const openStatusUpdateDialog = (officer: Officer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStatusUpdateOfficer(officer);
    setNewStatus(officer.status);
    setIsUpdatingStatus(true);
  };

  const handleUpdateOfficerStatus = async () => {
    if (!statusUpdateOfficer) return;
    
    try {
      const updatedOfficer = await updateOfficerStatus(
        statusUpdateOfficer.id, 
        newStatus, 
        newStatus === 'responding' ? statusUpdateOfficer.currentIncidentId : undefined
      );
      
      toast({
        title: 'Status Updated',
        description: `${updatedOfficer.name}'s status updated to ${newStatus}`,
      });
      
      setIsUpdatingStatus(false);
      setStatusUpdateOfficer(null);
      
      return updatedOfficer;
    } catch (error) {
      console.error('Error updating officer status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update officer status',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    isUpdatingStatus,
    setIsUpdatingStatus,
    statusUpdateOfficer,
    setStatusUpdateOfficer,
    newStatus,
    setNewStatus,
    openStatusUpdateDialog,
    handleUpdateOfficerStatus
  };
}
