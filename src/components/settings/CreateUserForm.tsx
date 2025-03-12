
import React, { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { UserPlus, X } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { signUp, createUserRecord } from '@/lib/supabase';
import { useData } from '@/context/DataContext';

interface NewAccountFormData {
  name: string;
  email: string;
  role: string;
  password: string;
}

const CreateUserForm = () => {
  const { toast } = useToast();
  const { createOfficer: createOfficerData } = useData();
  const [isSaving, setIsSaving] = useState(false);
  const [newAccounts, setNewAccounts] = useState<NewAccountFormData[]>([]);

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

        // Make sure the password meets Supabase requirements (min 6 chars)
        if (account.password.length < 6) {
          toast({
            title: 'Password Error',
            description: 'Password should be at least 6 characters long',
            variant: 'destructive'
          });
          continue;
        }

        const { data: authData, error: authError } = await signUp(
          account.email,
          account.password,
          {
            name: account.name,
            role: account.role,
          }
        );
        
        if (authError) {
          console.error('Error creating auth user:', authError);
          toast({
            title: 'Creation Failed',
            description: `Failed to create account for ${account.email}: ${authError.message}`,
            variant: 'destructive'
          });
          continue;
        }
        
        const userData = {
          username: account.email,
          name: account.name,
          role: account.role,
          password: account.password, // Store the password in our users table
        };
        
        const { data, error } = await createUserRecord(userData);
        
        if (error) {
          console.error('Error creating user record:', error);
          toast({
            title: 'Creation Failed',
            description: `Failed to create user record for ${account.email}: ${error.message}`,
            variant: 'destructive'
          });
          continue;
        }

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
        
        toast({
          title: 'Account Created',
          description: `Successfully created account for ${account.email}`,
        });
      }
      
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

  return (
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
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
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
  );
};

export default CreateUserForm;
