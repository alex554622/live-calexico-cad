
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserIcon } from 'lucide-react';
import { useAccountSettings } from '@/hooks/use-account-settings';
import ProfileSection from '@/components/settings/ProfileSection';
import PasswordSection from '@/components/settings/PasswordSection';

const AccountSettings = () => {
  const { 
    userProfile, 
    isSaving, 
    handleInputChange, 
    handleUpdateAccount, 
    resetForm 
  } = useAccountSettings();

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
        <ProfileSection 
          userProfile={userProfile} 
          onChange={handleInputChange} 
        />
        
        <PasswordSection 
          userProfile={userProfile} 
          onChange={handleInputChange} 
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={resetForm}
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
