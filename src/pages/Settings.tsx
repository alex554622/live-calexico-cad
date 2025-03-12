
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccountSettings from '@/components/settings/AccountSettings';
import CreateUserForm from '@/components/settings/CreateUserForm';
import UsersList from '@/components/settings/UsersList';
import SystemSettings from '@/components/settings/SystemSettings';
import { useIsMobile } from '@/hooks/use-mobile';

const Settings = () => {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList 
          className={cn(
            "grid w-full", 
            isMobile ? "overflow-x-auto" : "max-w-3xl"
          )} 
          style={{ 
            gridTemplateColumns: hasPermission('manageSettings') 
              ? (isMobile ? "repeat(3, minmax(100px, 1fr))" : "repeat(3, 1fr)") 
              : (isMobile ? "repeat(2, minmax(100px, 1fr))" : "repeat(2, 1fr)") 
          }}
        >
          <TabsTrigger value="account">Account</TabsTrigger>
          {hasPermission('manageSettings') && (
            <>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <TabsContent value="account" className={cn(
          "space-y-6",
          isMobile ? "w-full" : "max-w-3xl"
        )}>
          <AccountSettings />
          
          {hasPermission('manageSettings') && (
            <CreateUserForm />
          )}
        </TabsContent>
        
        {hasPermission('manageSettings') && (
          <TabsContent value="users" className={cn(
            isMobile ? "w-full" : "max-w-3xl"
          )}>
            <UsersList />
          </TabsContent>
        )}
        
        {hasPermission('manageSettings') && (
          <TabsContent value="system" className={cn(
            isMobile ? "w-full" : "max-w-3xl"
          )}>
            <SystemSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
