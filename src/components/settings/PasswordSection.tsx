
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { AccountFormState } from '@/hooks/use-account-settings';

interface PasswordSectionProps {
  userProfile: AccountFormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({ userProfile, onChange }) => {
  return (
    <div className="space-y-4">
      <Separator className="my-4" />
      
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input 
          id="currentPassword" 
          type="password"
          value={userProfile.currentPassword}
          onChange={onChange} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input 
          id="newPassword" 
          type="password"
          value={userProfile.newPassword}
          onChange={onChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input 
          id="confirmPassword" 
          type="password"
          value={userProfile.confirmPassword}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default PasswordSection;
