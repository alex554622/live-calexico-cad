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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Shield, User as UserIcon, UserPlus, X, Save, Database, UserX, Users, Trash2 } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { updateOfficer, createOfficer, updateUser, createUser, getAllUsers, deleteUser } from '@/services/api';
import { useData } from '@/context/DataContext';
import type { User } from '@/types';

const Settings = () => {
  const { user, hasPermission, updateCurrentUser } = useAuth();
  const { toast } = useToast();
  const { createOfficer: createOfficerData } = useData();
  const [isSaving, setIsSaving] = useState(false);
  const [newAccounts, setNewAccounts] = useState<Array<{name: string; email: string; role: string; password: string}>>([]);
  const [dataRetention, setDataRetention] = useState("5"); // Default 5 days
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: user?.name || '',
    email: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name || '',
        email: user.username || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (hasPermission('manageSettings')) {
      fetchUsers();
    }
  }, [hasPermission]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const users = await getAllUsers();
      setUsersList(users);
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
      await deleteUser(userId);
      
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been saved successfully',
      });
      
      localStorage.setItem('dataRetention', dataRetention);
    }, 1000);
  };

  const handleUpdateAccount = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    if (userProfile.newPassword) {
      if (userProfile.newPassword !== userProfile.confirmPassword) {
        toast({
          title: 'Password Error',
          description: 'New password and confirmation do not match',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }
      
      if (!userProfile.currentPassword) {
        toast({
          title: 'Password Error',
          description: 'Please enter your current password',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }
      
      const correctPassword = user.username === 'alexvalla' ? '!345660312' : (user as any).password;
      
      if (userProfile.currentPassword !== correctPassword) {
        toast({
          title: 'Password Error',
          description: 'Current password is incorrect',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }
    }

    try {
      const updatedUserData = {
        name: userProfile.name,
        username: userProfile.email,
        ...(userProfile.newPassword ? { password: userProfile.newPassword } : {})
      };
      
      const updatedUser = await updateUser(user.id, updatedUserData);
      
      if (updateCurrentUser) {
        updateCurrentUser(updatedUser);
      }
      
      setUserProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        name: updatedUser.name,
        email: updatedUser.username
      }));
      
      toast({
        title: 'Account Updated',
        description: 'Your account information has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update account information',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAccounts = async () => {
    if (newAccounts.length === 0) return;
    
    setIsSaving(true);

    try {
      for (const account of newAccounts) {
        if (!account.name || !account.email || !account.password || !account.role) {
          toast({
            title: 'Validation Error',
            description: 'All fields are required for new accounts',
            variant: 'destructive'
          });
          continue;
        }

        await createUser({
          username: account.email,
          name: account.name,
          role: account.role as 'admin' | 'dispatcher' | 'supervisor' | 'officer',
          password: account.password
        });

        if (account.role === 'officer') {
          await createOfficerData({
            badgeNumber: `CPD-${Math.floor(1000 + Math.random() * 9000)}`,
            name: account.name,
            rank: 'Patrol Officer',
            department: 'Central',
            status: 'available',
            contactInfo: {
              phone: '',
              email: account.email,
            },
            shiftSchedule: 'Mon-Fri 8am-4pm',
            location: {
              lat: 32.6789,
              lng: -115.4989,
            }
          });
        }
      }

      toast({
        title: 'Accounts Created',
        description: `Successfully created ${newAccounts.length} new account(s)`,
      });
      
      setNewAccounts([]);
      
      fetchUsers();
    } catch (error) {
      console.error('Error creating accounts:', error);
      toast({
        title: 'Creation Failed',
        description: 'Failed to create one or more accounts',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAccount = () => {
    setNewAccounts([...newAccounts, { name: '', email: '', role: 'officer', password: '' }]);
  };

  const handleRemoveAccount = (index: number) => {
    const updatedAccounts = [...newAccounts];
    updatedAccounts.splice(index, 1);
    setNewAccounts(updatedAccounts);
  };

  const handleAccountChange = (index: number, field: string, value: string) => {
    const updatedAccounts = [...newAccounts];
    updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
    setNewAccounts(updatedAccounts);
  };

  const isAlexValla = user?.username === 'alexvalla';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full max-w-3xl" style={{ gridTemplateColumns: hasPermission('manageSettings') ? "repeat(3, 1fr)" : "repeat(2, 1fr)" }}>
          <TabsTrigger value="account">Account</TabsTrigger>
          {hasPermission('manageSettings') && (
            <>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <TabsContent value="account" className="max-w-3xl space-y-6">
          {isAlexValla && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Update your account information and password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={userProfile.name} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={userProfile.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password"
                      value={userProfile.currentPassword}
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={userProfile.newPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={userProfile.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUserProfile({
                      name: user?.name || '',
                      email: user?.username || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateAccount} 
                  disabled={isSaving}
                >
                  {isSaving ? 'Updating...' : 'Update Account'}
                </Button>
              </CardFooter>
            </Card>
          )}

          {hasPermission('manageSettings') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  User Accounts
                </CardTitle>
                <CardDescription>
                  Add and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {newAccounts.map((account, index) => (
                  <div key={index} className="p-4 border rounded-md bg-muted/30 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">New Account</h4>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveAccount(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`account-name-${index}`}>Full Name</Label>
                      <Input 
                        id={`account-name-${index}`} 
                        value={account.name}
                        onChange={(e) => handleAccountChange(index, 'name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`account-email-${index}`}>Email</Label>
                      <Input 
                        id={`account-email-${index}`} 
                        type="email"
                        value={account.email}
                        onChange={(e) => handleAccountChange(index, 'email', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`account-password-${index}`}>Password</Label>
                      <Input 
                        id={`account-password-${index}`} 
                        type="password"
                        value={account.password}
                        onChange={(e) => handleAccountChange(index, 'password', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`account-role-${index}`}>Role</Label>
                      <Select
                        value={account.role}
                        onValueChange={(value) => handleAccountChange(index, 'role', value)}
                      >
                        <SelectTrigger id={`account-role-${index}`}>
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
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleAddAccount}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Account
                </Button>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleCreateAccounts} 
                  disabled={isSaving || newAccounts.length === 0}
                  className="ml-auto"
                >
                  {isSaving ? 'Creating...' : 'Create Accounts'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        {hasPermission('manageSettings') && (
          <TabsContent value="users" className="max-w-3xl">
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
          </TabsContent>
        )}
        
        {hasPermission('manageSettings') && (
          <TabsContent value="system" className="max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure system-wide settings (admin only)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="systemName">System Name</Label>
                  <Input id="systemName" defaultValue="Calexico Police CAD" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention (days)</Label>
                  <Input 
                    id="dataRetention" 
                    type="number" 
                    min="1" 
                    max="30"
                    value={dataRetention}
                    onChange={(e) => setDataRetention(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    How long to keep incident data before automatic deletion (1-30 days, default: 5)
                  </p>
                </div>

                <Card className="bg-muted/30 border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      Data Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      Incidents older than the data retention period will be automatically deleted.
                      Make sure to download important data before it expires.
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Auto-Delete Old Incidents</p>
                          <p className="text-sm text-muted-foreground">
                            Automatically delete incidents after retention period
                          </p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Separator />
                
                <div className="space-y-4">
                  <Label>System Features</Label>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Enable Real-time Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically push updates to all clients
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Advanced Reporting</p>
                      <p className="text-sm text-muted-foreground">
                        Enable advanced reporting and analytics features
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save System Settings'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>

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
    </div>
  );
};

export default Settings;
