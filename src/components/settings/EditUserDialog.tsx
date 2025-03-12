
import React from 'react';
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
import { useEditUser } from '@/hooks/use-edit-user';
import type { User } from '@/types';

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (refreshList?: boolean) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, open, onOpenChange }) => {
  const { 
    editUserForm, 
    isSaving, 
    handleEditFormChange, 
    handleUpdateUser 
  } = useEditUser(user, onOpenChange);

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
