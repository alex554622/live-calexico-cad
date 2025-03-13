
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Officer, OfficerStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface UseOfficerFormProps {
  initialData?: Officer;
  onSuccess?: (officer: Officer) => void;
}

export function useOfficerForm({ initialData, onSuccess }: UseOfficerFormProps) {
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

  return {
    formData,
    isSubmitting,
    handleChange,
    handleSelectChange,
    handleSubmit
  };
}
