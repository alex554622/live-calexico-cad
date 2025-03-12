
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
import { Shield, User, UserPlus, X, Save, Database } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateOfficer, createOfficer, updateUser, createUser } from '@/services/api';
import { useData } from '@/context/DataContext';

const Settings = () => {
  const { user, hasPermission, updateCurrentUser } = useAuth();
  const { toast } = useToast();
  const { createOfficer: createOfficerData } = useData();
  const [isSaving, setIsSaving] = useState(false);
  const [newAccounts, setNewAccounts] = useState<Array<{name: string; email: string; role: string; password: string}>>([]);
  const [dataRetention, setDataRetention] = useState("5"); // Default 5 days
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
      
      // For the admin hardcoded password or for other users
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
      
      // Update the current user in AuthContext
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid grid-cols-2 w-full max-w-3xl">
          <TabsTrigger value="account">Account</TabsTrigger>
          {hasPermission('manageSettings') && (
            <TabsTrigger value="system">System</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="account" className="max-w-3xl space-y-6">
          {isAlexValla && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
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
    </div>
  );
};

export default Settings;
