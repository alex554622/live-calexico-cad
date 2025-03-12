
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NewAccountFormData } from '@/types/user';

interface NewAccountFormItemProps {
  account: NewAccountFormData;
  index: number;
  onChange: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}

const NewAccountFormItem = ({ 
  account, 
  index, 
  onChange, 
  onRemove 
}: NewAccountFormItemProps) => {
  return (
    <div className="p-4 border rounded-md bg-muted/30 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">New Account</h4>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onRemove(index)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`account-name-${index}`}>Full Name</Label>
        <Input 
          id={`account-name-${index}`} 
          value={account.name}
          onChange={(e) => onChange(index, 'name', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`account-email-${index}`}>Email</Label>
        <Input 
          id={`account-email-${index}`} 
          type="email"
          value={account.email}
          onChange={(e) => onChange(index, 'email', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`account-password-${index}`}>Password</Label>
        <Input 
          id={`account-password-${index}`} 
          type="password"
          value={account.password}
          onChange={(e) => onChange(index, 'password', e.target.value)}
          minLength={6}
        />
        <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`account-role-${index}`}>Role</Label>
        <Select
          value={account.role}
          onValueChange={(value) => onChange(index, 'role', value)}
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
  );
};

export default NewAccountFormItem;
