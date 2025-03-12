
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { AccountFormState } from '@/hooks/use-account-settings';

interface ProfileSectionProps {
  userProfile: AccountFormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ userProfile, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          value={userProfile.name} 
          onChange={onChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          type="email" 
          value={userProfile.email}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default ProfileSection;
