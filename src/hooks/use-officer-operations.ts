
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Officer } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useOfficerOperations() {
  const { deleteOfficer } = useData();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleCreateSuccess = (newOfficer: Officer) => {
    setIsCreating(false);
    return newOfficer;
  };

  const handleDeleteSelected = async (selectedOfficers: string[]) => {
    try {
      for (const id of selectedOfficers) {
        await deleteOfficer(id);
      }
      
      toast({
        title: 'Officers Deleted',
        description: `${selectedOfficers.length} officer(s) have been deleted`,
      });
      
      setIsConfirmingDelete(false);
      return true;
    } catch (error) {
      console.error('Error deleting officers:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete selected officers',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleDeleteOfficer = async (officerId: string) => {
    try {
      await deleteOfficer(officerId);
      
      toast({
        title: 'Officer Deleted',
        description: `Officer has been deleted successfully`,
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting officer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete officer',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    isCreating,
    setIsCreating,
    isConfirmingDelete,
    setIsConfirmingDelete,
    handleCreateSuccess,
    handleDeleteSelected,
    handleDeleteOfficer
  };
}
