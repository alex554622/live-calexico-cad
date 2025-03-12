
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { getUsers, createViewOnlyUser } from '@/services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Users } from 'lucide-react';

const UserManagement = () => {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('manageSettings')) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to create users',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingUser(true);
      const user = await createViewOnlyUser(
        newUser.username,
        newUser.password,
        newUser.name
      );
      
      setUsers(prev => [...prev, user]);
      
      toast({
        title: 'User Created',
        description: `${user.name} has been created with view-only permissions`,
      });
      
      setDialogOpen(false);
      setNewUser({
        username: '',
        password: '',
        name: '',
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setCreatingUser(false);
    }
  };

  if (!hasPermission('manageSettings')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to access user management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users and their access permissions.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add View-Only User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New View-Only User</DialogTitle>
              <DialogDescription>
                This user will only be able to view the dashboard, officers, and incidents without editing permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creatingUser}>
                  {creatingUser ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            System Users
          </CardTitle>
          <CardDescription>
            Manage all users who have access to the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Access Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary mr-2 overflow-hidden">
                          {user.avatar && (
                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Badge variant="destructive">Full Access</Badge>
                      ) : (
                        <Badge variant="outline">View Only</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
