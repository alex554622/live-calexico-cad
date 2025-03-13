
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface OfficerDepartmentFieldsProps {
  rank: string;
  department: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OfficerDepartmentFields: React.FC<OfficerDepartmentFieldsProps> = ({
  rank,
  department,
  onChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="rank">Rank</Label>
        <Input
          id="rank"
          name="rank"
          value={rank}
          onChange={onChange}
          placeholder="Enter officer rank"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          name="department"
          value={department}
          onChange={onChange}
          placeholder="Enter department"
          required
        />
      </div>
    </div>
  );
};

export default OfficerDepartmentFields;
