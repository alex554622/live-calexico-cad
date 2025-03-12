
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Trash2 } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { getAllUsers, deleteUserRecord } from '@/lib/supabase';
import type { User } from '@/types';
import EditUserDialog from './EditUserDialog';

const UsersList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await getAllUsers();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setUsersList(data as User[]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user accounts',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsSaving(true);
      
      const { error } = await deleteUserRecord(userId);
      
      if (error) {
        throw error;
      }
      
      await fetchUsers();
      
      toast({
        title: 'User Deleted',
        description: 'The user account has been deleted successfully',
      });
      
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete user account',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditDialog(true);
  };

  const handleEditDialogClose = (refreshList: boolean = false) => {
    setShowEditDialog(false);
    setEditingUser(null);
    if (refreshList) {
      fetchUsers();
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500">Administrator</Badge>;
      case 'supervisor':
        return <Badge className="bg-amber-500">Supervisor</Badge>;
      case 'dispatcher':
        return <Badge className="bg-blue-500">Dispatcher</Badge>;
      case 'officer':
        return <Badge className="bg-green-500">Officer</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            All User Accounts
          </CardTitle>
          <CardDescription>
            View and manage all user accounts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading accounts...</div>
          ) : usersList.length === 0 ? (
            <div className="text-center py-4">No user accounts found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersList.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {userItem.avatar && (
                          <img src={userItem.avatar} alt={userItem.name} className="w-8 h-8 rounded-full" />
                        )}
                        <span>{userItem.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{userItem.username}</TableCell>
                    <TableCell>{getRoleBadge(userItem.role)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(userItem)}
                          disabled={userItem.username === 'alexvalla'}
                          title={userItem.username === 'alexvalla' ? 'Cannot edit administrator account' : 'Edit account'}
                        >
                          <Shield className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setUserToDelete(userItem);
                            setShowDeleteDialog(true);
                          }}
                          disabled={userItem.username === 'alexvalla' || (user && userItem.id === user.id)}
                          title={userItem.username === 'alexvalla' ? 'Cannot delete administrator account' : 
                                (user && userItem.id === user.id) ? 'Cannot delete your own account' : 
                                'Delete account'}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={fetchUsers} 
            disabled={isLoading}
            className="ml-auto"
          >
            Refresh List
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account for <strong>{userToDelete?.name}</strong>?
              {userToDelete?.role === 'officer' && (
                <p className="mt-2 text-amber-500">
                  Note: This will also delete the associated officer record.
                </p>
              )}
              <p className="mt-2">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
              disabled={isSaving}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingUser && (
        <EditUserDialog 
          user={editingUser} 
          open={showEditDialog} 
          onOpenChange={handleEditDialogClose} 
        />
      )}
    </>
  );
};

export default UsersList;
