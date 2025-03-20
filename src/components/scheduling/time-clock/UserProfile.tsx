
import React from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

interface UserProfileProps {
  currentTime: Date;
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentTime }) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-muted/50">
      <Avatar className="h-16 w-16">
        <AvatarImage src={user?.avatar} alt={user?.name} />
        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 text-center sm:text-left">
        <h3 className="font-medium text-lg">{user?.name}</h3>
        <p className="text-muted-foreground text-sm">{user?.role}</p>
        {user?.id && <p className="text-xs text-muted-foreground">ID: {user.id.substring(0, 8)}...</p>}
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold">{format(currentTime, 'h:mm:ss')}</div>
        <div className="text-xs text-muted-foreground">{format(currentTime, 'a')}</div>
        <div className="text-sm mt-1">{format(currentTime, 'MMM d, yyyy')}</div>
      </div>
    </div>
  );
};
