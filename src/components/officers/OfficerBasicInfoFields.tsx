
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface OfficerBasicInfoFieldsProps {
  name: string;
  badgeNumber: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OfficerBasicInfoFields: React.FC<OfficerBasicInfoFieldsProps> = ({
  name,
  badgeNumber,
  onChange
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={onChange}
          placeholder="Enter officer name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="badgeNumber">Badge Number</Label>
        <Input
          id="badgeNumber"
          name="badgeNumber"
          value={badgeNumber}
          onChange={onChange}
          placeholder="Enter badge number"
          required
        />
      </div>
    </>
  );
};

export default OfficerBasicInfoFields;
