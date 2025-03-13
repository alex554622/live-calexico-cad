
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OfficerStatus } from '@/types';

interface OfficerScheduleFieldsProps {
  shiftSchedule: string;
  status: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

const OfficerScheduleFields: React.FC<OfficerScheduleFieldsProps> = ({
  shiftSchedule,
  status,
  onInputChange,
  onSelectChange
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="shiftSchedule">Shift Schedule</Label>
        <Input
          id="shiftSchedule"
          name="shiftSchedule"
          value={shiftSchedule}
          onChange={onInputChange}
          placeholder="Enter shift schedule"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) => onSelectChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="responding">Responding</SelectItem>
            <SelectItem value="offDuty">Off Duty</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default OfficerScheduleFields;
