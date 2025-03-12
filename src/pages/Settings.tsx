
import React, { useState } from 'react';
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
import { Shield, User, UserPlus, X } from 'lucide-react';

const Settings = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [newAccounts, setNewAccounts] = useState<Array<{name: string; email: string; role: string}>>([]);

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been saved successfully',
      });
    }, 1000);
  };

  const handleAddAccount = () => {
    setNewAccounts([...newAccounts, { name: '', email: '', role: 'officer' }]);
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
                <Input id="name" defaultValue={user?.name || ''} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={user?.username || ''} />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Update Account'}
              </Button>
            </CardFooter>
          </Card>

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
                      <Label htmlFor={`account-role-${index}`}>Role</Label>
                      <select
                        id={`account-role-${index}`}
                        value={account.role}
                        onChange={(e) => handleAccountChange(index, 'role', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="officer">Officer</option>
                        <option value="dispatcher">Dispatcher</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Administrator</option>
                      </select>
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
                  onClick={handleSaveSettings} 
                  disabled={isSaving || newAccounts.length === 0}
                  className="ml-auto"
                >
                  {isSaving ? 'Saving...' : 'Create Accounts'}
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
                  <Input id="dataRetention" type="number" defaultValue="90" />
                  <p className="text-sm text-muted-foreground">
                    How long to keep incident data before archiving
                  </p>
                </div>
                
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
