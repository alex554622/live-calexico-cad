
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { updateUserRecord } from '@/lib/supabase';
import type { User } from '@/types';

export interface AccountFormState {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function useAccountSettings() {
  const { user, updateCurrentUser } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<AccountFormState>({
    name: user?.name || '',
    email: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name || '',
        email: user.username || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const resetForm = () => {
    setUserProfile({
      name: user?.name || '',
      email: user?.username || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleUpdateAccount = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    if (userProfile.newPassword) {
      if (userProfile.newPassword !== userProfile.confirmPassword) {
        toast({
          title: 'Password Error',
          description: 'New password and confirmation do not match',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }
      
      if (!userProfile.currentPassword) {
        toast({
          title: 'Password Error',
          description: 'Please enter your current password',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }
      
      console.log('Password would be updated');
    }

    try {
      const updatedUserData = {
        name: userProfile.name,
        username: userProfile.email,
      };
      
      const { data, error } = await updateUserRecord(user.id, updatedUserData);
      
      if (error) {
        throw error;
      }
      
      if (updateCurrentUser && data && data[0]) {
        updateCurrentUser(data[0] as User);
      }
      
      setUserProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
      toast({
        title: 'Account Updated',
        description: 'Your account information has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update account information',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    userProfile,
    isSaving,
    handleInputChange,
    handleUpdateAccount,
    resetForm
  };
}
