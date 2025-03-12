
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserRoleBadgeProps {
  role: string;
}

const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
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

export default UserRoleBadge;
