import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Officer, OfficerStatus } from '@/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type OfficerFormProps = {
  initialData?: Officer;
  onClose: () => void;
  onSuccess?: (officer: Officer) => void;
  onCancel?: () => void;
};

const OfficerForm = ({ initialData, onClose, onSuccess, onCancel = onClose }: OfficerFormProps) => {
  const { createOfficer, updateOfficer } = useData();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    badgeNumber: initialData?.badgeNumber || '',
    rank: initialData?.rank || '',
    department: initialData?.department || '',
    status: initialData?.status || 'available',
    contactInfo: {
      phone: initialData?.contactInfo?.phone || '',
      email: initialData?.contactInfo?.email || '',
    },
    shiftSchedule: initialData?.shiftSchedule || ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleContactInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('createOfficer') && !hasPermission('editOfficer')) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to perform this action',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (initialData) {
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
          description: `${updatedOfficer.name}'s information has been updated`,
        });
        
        if (onSuccess) onSuccess(updatedOfficer);
        onClose();
      } else {
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
          description: `${newOfficer.name} has been added to the system`,
        });
        
        if (onSuccess) onSuccess(newOfficer);
        onClose();
      }
    } catch (error) {
      console.error('Error saving officer:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the officer information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Officer' : 'Add New Officer'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="badgeNumber">Badge Number</Label>
            <Input
              id="badgeNumber"
              value={formData.badgeNumber}
              onChange={(e) => handleChange('badgeNumber', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rank">Rank</Label>
            <Input
              id="rank"
              value={formData.rank}
              onChange={(e) => handleChange('rank', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
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
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.contactInfo.phone}
              onChange={(e) => handleContactInfoChange('phone', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.contactInfo.email}
              onChange={(e) => handleContactInfoChange('email', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shiftSchedule">Shift Schedule</Label>
            <Input
              id="shiftSchedule"
              value={formData.shiftSchedule}
              onChange={(e) => handleChange('shiftSchedule', e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OfficerForm;
