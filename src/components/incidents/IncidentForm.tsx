
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Incident, IncidentPriority, IncidentStatus } from '@/types';
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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    priority: IncidentPriority;
    status: IncidentStatus;
    address: string;
    documentLink?: string;
  }>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    status: initialData?.status || 'active',
    address: initialData?.location.address || '',
    documentLink: initialData?.documentLink || '',
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="title" className="text-sm">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter incident title"
          required
          className={isMobile ? "h-9 text-sm" : ""}
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="description" className="text-sm">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter incident description"
          rows={isMobile ? 3 : 4}
          required
          className={isMobile ? "text-sm" : ""}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="priority" className="text-sm">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleSelectChange('priority', value)}
          >
            <SelectTrigger className={isMobile ? "h-9 text-sm" : ""}>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="status" className="text-sm">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger className={isMobile ? "h-9 text-sm" : ""}>
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
      
      <div className="space-y-1">
        <Label htmlFor="address" className="text-sm">Location</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter incident address"
          required
          className={isMobile ? "h-9 text-sm" : ""}
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="documentLink" className="text-sm">
          <div className="flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            Google Docs Link
          </div>
        </Label>
        <Input
          id="documentLink"
          name="documentLink"
          value={formData.documentLink || ''}
          onChange={handleChange}
          placeholder="https://docs.google.com/document/d/..."
          className={isMobile ? "h-9 text-sm" : ""}
        />
        <p className="text-xs text-muted-foreground">
          Link to a Google Doc for detailed incident documentation
        </p>
      </div>
      
      <div className="flex justify-end space-x-2 pt-3">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            size={isMobile ? "sm" : "default"}
            className={isMobile ? "text-xs h-8" : ""}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          size={isMobile ? "sm" : "default"}
          className={isMobile ? "text-xs h-8" : ""}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Incident' : 'Create Incident'}
        </Button>
      </div>
    </form>
  );
};

export default IncidentForm;
