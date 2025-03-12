
import React, { useEffect, useState } from 'react';
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
import { Shield, Users, Trash2 } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User } from '@/types';
import EditUserDialog from './EditUserDialog';
import UserRoleBadge from './UserRoleBadge';
import DeleteUserDialog from './DeleteUserDialog';
import { useUsersList } from '@/hooks/use-users-list';

const UsersList = () => {
  const { user } = useAuth();
  const { usersList, isLoading, isSaving, fetchUsers, handleDeleteUser } = useUsersList();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  return (
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
                  <TableCell>
                    <UserRoleBadge role={userItem.role} />
                  </TableCell>
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

      <DeleteUserDialog
        user={userToDelete}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirmDelete={handleDeleteUser}
        isDeleting={isSaving}
      />

      {editingUser && (
        <EditUserDialog 
          user={editingUser} 
          open={showEditDialog} 
          onOpenChange={handleEditDialogClose} 
        />
      )}
    </Card>
  );
};

export default UsersList;
