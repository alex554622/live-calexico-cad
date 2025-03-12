import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Officer, OfficerStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface OfficerFormProps {
  initialData?: Officer;
  onSuccess?: (officer: Officer) => void;
  onCancel?: () => void;
}

const OfficerForm: React.FC<OfficerFormProps> = ({ 
  initialData, 
  onSuccess, 
  onCancel 
}) => {
  const { createOfficer, updateOfficer } = useData();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    badgeNumber: initialData?.badgeNumber || '',
    rank: initialData?.rank || '',
    department: initialData?.department || 'Calexico PD',
    status: initialData?.status || 'available',
    contactInfo: {
      phone: initialData?.contactInfo?.phone || '',
      email: initialData?.contactInfo?.email || '',
    },
    shiftSchedule: initialData?.shiftSchedule || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like contactInfo.phone
      const [parent, child] = name.split('.');
      setFormData(prev => {
        // Create a proper copy of the nested object before modifying it
        if (parent === 'contactInfo') {
          return {
            ...prev,
            contactInfo: {
              ...prev.contactInfo,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const permissionNeeded = initialData ? 'editOfficer' : 'createOfficer';
    if (!hasPermission(permissionNeeded)) {
      toast({
        title: 'Permission Denied',
        description: `You do not have permission to ${initialData ? 'edit' : 'create'} officers`,
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (initialData) {
        // Update existing officer
        const updatedOfficer = await updateOfficer(initialData.id, {
          name: formData.name,
          badgeNumber: formData.badgeNumber,
          rank: formData.rank,
          department: formData.department,
          status: formData.status as OfficerStatus,
          contactInfo: formData.contactInfo,
          shiftSchedule: formData.shiftSchedule
        });
        
        toast({
          title: 'Officer Updated',
          description: 'The officer has been updated successfully',
        });
        
        if (onSuccess) onSuccess(updatedOfficer);
      } else {
        // Create new officer
        const newOfficer = await createOfficer({
          name: formData.name,
          badgeNumber: formData.badgeNumber,
          rank: formData.rank,
          department: formData.department,
          status: formData.status as OfficerStatus,
          contactInfo: formData.contactInfo,
          shiftSchedule: formData.shiftSchedule,
          location: {
            lat: 0,
            lng: 0,
          }
        });
        
        toast({
          title: 'Officer Created',
          description: 'A new officer has been created successfully',
        });
        
        if (onSuccess) onSuccess(newOfficer);
      }
    } catch (error) {
      console.error('Error saving officer:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the officer',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter officer name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="badgeNumber">Badge Number</Label>
        <Input
          id="badgeNumber"
          name="badgeNumber"
          value={formData.badgeNumber}
          onChange={handleChange}
          placeholder="Enter badge number"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rank">Rank</Label>
          <Input
            id="rank"
            name="rank"
            value={formData.rank}
            onChange={handleChange}
            placeholder="Enter officer rank"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Enter department"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contactInfo.phone">Phone</Label>
        <Input
          id="contactInfo.phone"
          name="contactInfo.phone"
          value={formData.contactInfo.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contactInfo.email">Email</Label>
        <Input
          id="contactInfo.email"
          name="contactInfo.email"
          value={formData.contactInfo.email}
          onChange={handleChange}
          placeholder="Enter email address"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="shiftSchedule">Shift Schedule</Label>
        <Input
          id="shiftSchedule"
          name="shiftSchedule"
          value={formData.shiftSchedule}
          onChange={handleChange}
          placeholder="Enter shift schedule"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleSelectChange('status', value)}
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
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Officer' : 'Create Officer'}
        </Button>
      </div>
    </form>
  );
};

export default OfficerForm;
