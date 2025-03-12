
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers, deleteUserRecord } from '@/lib/supabase';
import type { User } from '@/types';

export const useUsersList = () => {
  const { toast } = useToast();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await getAllUsers();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setUsersList(data as User[]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user accounts',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsSaving(true);
      
      const { error } = await deleteUserRecord(userId);
      
      if (error) {
        throw error;
      }
      
      await fetchUsers();
      
      toast({
        title: 'User Deleted',
        description: 'The user account has been deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete user account',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    usersList,
    isLoading,
    isSaving,
    fetchUsers,
    handleDeleteUser
  };
};
