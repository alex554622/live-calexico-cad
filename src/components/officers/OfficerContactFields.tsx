
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface OfficerContactFieldsProps {
  phone: string;
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OfficerContactFields: React.FC<OfficerContactFieldsProps> = ({
  phone,
  email,
  onChange
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="contactInfo.phone">Phone</Label>
        <Input
          id="contactInfo.phone"
          name="contactInfo.phone"
          value={phone}
          onChange={onChange}
          placeholder="Enter phone number"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contactInfo.email">Email</Label>
        <Input
          id="contactInfo.email"
          name="contactInfo.email"
          value={email}
          onChange={onChange}
          placeholder="Enter email address"
        />
      </div>
    </>
  );
};

export default OfficerContactFields;
