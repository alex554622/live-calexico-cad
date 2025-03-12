
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
import { Shield, User } from 'lucide-react';

const Settings = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

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
        
        <TabsContent value="account" className="max-w-3xl">
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
