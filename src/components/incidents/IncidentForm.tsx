
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Incident, IncidentPriority, IncidentStatus, IncidentType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';

interface IncidentFormProps {
  initialData?: Incident;
  onSuccess?: (incident: Incident) => void;
  onCancel?: () => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ 
  initialData, 
  onSuccess, 
  onCancel 
}) => {
  const { createIncident, updateIncident } = useData();
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    priority: IncidentPriority;
    status: IncidentStatus;
    address: string;
    documentLink?: string;
    type: IncidentType;
  }>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    status: initialData?.status || 'active',
    address: initialData?.location.address || '',
    documentLink: initialData?.documentLink || '',
    type: initialData?.type || 'other',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('createIncident') && !initialData) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to create incidents',
        variant: 'destructive',
      });
      return;
    }
    
    if (initialData && !hasPermission('editIncident')) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to edit incidents',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (initialData) {
        // Update existing incident
        const updatedIncident = await updateIncident(initialData.id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          location: {
            ...initialData.location,
            address: formData.address,
          },
          documentLink: formData.documentLink,
          type: formData.type,
        });
        
        toast({
          title: 'Incident Updated',
          description: 'The incident has been updated successfully',
        });
        
        if (onSuccess) onSuccess(updatedIncident);
      } else {
        // Create new incident
        const newIncident = await createIncident({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          location: {
            address: formData.address,
            lat: 0, // These would be set by geocoding in a real app
            lng: 0,
          },
          assignedOfficers: [],
          reportedBy: user?.name || 'Unknown',
          documentLink: formData.documentLink,
          type: formData.type,
        });
        
        toast({
          title: 'Incident Created',
          description: 'A new incident has been created successfully',
        });
        
        if (onSuccess) onSuccess(newIncident);
      }
    } catch (error) {
      console.error('Error saving incident:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the incident',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter incident title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          onChange={handleChange}
          placeholder="Enter incident description"
          rows={4}
          required
          value={formData.description}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleSelectChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Incident Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleSelectChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select incident type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="traffic">Traffic</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="assistance">Assistance</SelectItem>
            <SelectItem value="criminal">Criminal</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Location</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter incident address"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="documentLink">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Google Docs Link
          </div>
        </Label>
        <Input
          id="documentLink"
          name="documentLink"
          value={formData.documentLink || ''}
          onChange={handleChange}
          placeholder="https://docs.google.com/document/d/..."
        />
        <p className="text-xs text-muted-foreground">
          Link to a Google Doc for detailed incident documentation
        </p>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Incident' : 'Create Incident'}
        </Button>
      </div>
    </form>
  );
};

export default IncidentForm;
