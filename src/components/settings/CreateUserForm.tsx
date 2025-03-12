
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
import { UserPlus } from 'lucide-react';
import { useCreateUser } from '@/hooks/use-create-user';
import { NewAccountFormData } from '@/types/user';
import NewAccountFormItem from './NewAccountFormItem';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const CreateUserForm = () => {
  const { createAccounts, isSaving } = useCreateUser();
  const [newAccounts, setNewAccounts] = useState<NewAccountFormData[]>([]);
  const isMobile = useIsMobile();

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
    const success = await createAccounts(newAccounts);
    if (success) {
      setNewAccounts([]);
    }
  };

  return (
    <Card className={cn(
      isMobile ? "overflow-hidden" : ""
    )}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="h-5 w-5 mr-2" />
          User Accounts
        </CardTitle>
        <CardDescription>
          Add and manage user accounts
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(
        "space-y-6",
        isMobile ? "px-3" : ""
      )}>
        {newAccounts.map((account, index) => (
          <NewAccountFormItem 
            key={index}
            account={account}
            index={index}
            onChange={handleAccountChange}
            onRemove={handleRemoveAccount}
          />
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
      <CardFooter className={cn(
        isMobile ? "flex-col space-y-2" : ""
      )}>
        <Button 
          onClick={handleCreateAccounts} 
          disabled={isSaving || newAccounts.length === 0}
          className={cn(
            isMobile ? "w-full" : "ml-auto"
          )}
        >
          {isSaving ? 'Creating...' : 'Create Accounts'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateUserForm;
