
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Officer } from '@/types';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';
import { format } from 'date-fns';

interface OfficerCardProps {
  officer: Officer;
  onClick?: () => void;
}

const OfficerCard: React.FC<OfficerCardProps> = ({ officer, onClick }) => {
  return (
    <Card 
      className="dashboard-card cursor-pointer hover:border-primary"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium">{officer.name}</CardTitle>
          <OfficerStatusBadge status={officer.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 bg-police text-white">
            <AvatarFallback>{officer.name.split(' ')[0][0] + (officer.name.split(' ')[1]?.[0] || '')}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{officer.rank}</p>
            <p className="text-xs font-medium">Badge #{officer.badgeNumber}</p>
            <p className="text-xs text-muted-foreground">
              Last updated: {format(new Date(officer.lastUpdated), 'h:mm a')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficerCard;
