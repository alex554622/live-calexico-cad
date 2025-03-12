
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { UserIcon } from 'lucide-react';
import { updateUserRecord } from '@/lib/supabase';
import type { User } from '@/types';

const AccountSettings = () => {
  const { user, updateCurrentUser } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState({
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserIcon className="h-5 w-5 mr-2" />
          Account Settings
        </CardTitle>
        <CardDescription>
          Update your account information and password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            value={userProfile.name} 
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            value={userProfile.email}
            onChange={handleInputChange}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input 
              id="currentPassword" 
              type="password"
              value={userProfile.currentPassword}
              onChange={handleInputChange} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
              id="newPassword" 
              type="password"
              value={userProfile.newPassword}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input 
              id="confirmPassword" 
              type="password"
              value={userProfile.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            setUserProfile({
              name: user?.name || '',
              email: user?.username || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpdateAccount} 
          disabled={isSaving}
        >
          {isSaving ? 'Updating...' : 'Update Account'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccountSettings;
