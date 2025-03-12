
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateUserRecord } from '@/lib/supabase';
import type { User } from '@/types';

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (refreshList?: boolean) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, open, onOpenChange }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    name: user.name || '',
    email: user.username || '',
    role: user.role || 'officer',
    password: '',
  });

  const handleEditFormChange = (field: string, value: string) => {
    setEditUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateUser = async () => {
    try {
      setIsSaving(true);
      
      const userData = {
        name: editUserForm.name,
        username: editUserForm.email,
        role: editUserForm.role,
      };
      
      const { data, error } = await updateUserRecord(user.id, userData);
      
      if (error) {
        throw error;
      }
      
      if (editUserForm.password) {
        console.log('Password would be updated');
      }
      
      toast({
        title: 'User Updated',
        description: 'The user account has been updated successfully',
      });
      
      onOpenChange(true); // Close dialog and refresh list
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update user account',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={() => onOpenChange()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit User Account</AlertDialogTitle>
          <AlertDialogDescription>
            Update information for <strong>{user.name}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input 
              id="edit-name" 
              value={editUserForm.name}
              onChange={(e) => handleEditFormChange('name', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input 
              id="edit-email" 
              type="email"
              value={editUserForm.email}
              onChange={(e) => handleEditFormChange('email', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select
              value={editUserForm.role}
              onValueChange={(value) => handleEditFormChange('role', value)}
            >
              <SelectTrigger id="edit-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="officer">Officer</SelectItem>
                <SelectItem value="dispatcher">Dispatcher</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-password">New Password (optional)</Label>
            <Input 
              id="edit-password" 
              type="password"
              value={editUserForm.password}
              onChange={(e) => handleEditFormChange('password', e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUpdateUser}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditUserDialog;
