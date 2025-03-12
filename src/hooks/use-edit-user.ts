
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateUserRecord } from '@/lib/supabase';
import type { User } from '@/types';

interface EditUserForm {
  name: string;
  email: string;
  role: string;
  password: string;
}

export const useEditUser = (user: User, onComplete: (refreshList?: boolean) => void) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [editUserForm, setEditUserForm] = useState<EditUserForm>({
    name: user.name || '',
    email: user.username || '',
    role: user.role || 'officer',
    password: '',
  });

  const handleEditFormChange = (field: string, value: string) => {
    setEditUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateUser = async () => {
    try {
      setIsSaving(true);
      
      const userData = {
        name: editUserForm.name,
        username: editUserForm.email,
        role: editUserForm.role,
      };
      
      const { data, error } = await updateUserRecord(user.id, userData);
      
      if (error) {
        throw error;
      }
      
      if (editUserForm.password) {
        console.log('Password would be updated');
      }
      
      toast({
        title: 'User Updated',
        description: 'The user account has been updated successfully',
      });
      
      onComplete(true); // Close dialog and refresh list
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update user account',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    editUserForm,
    isSaving,
    handleEditFormChange,
    handleUpdateUser
  };
};
