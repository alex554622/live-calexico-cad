
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Incident } from '@/types';
import IncidentPriorityBadge from '@/components/common/IncidentPriorityBadge';
import IncidentStatusBadge from '@/components/common/IncidentStatusBadge';
import { format } from 'date-fns';
import { MapPin, Users } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  onClick?: () => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onClick }) => {
  return (
    <Card 
      className="dashboard-card cursor-pointer hover:border-primary"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium">{incident.title}</CardTitle>
          <div className="flex gap-2">
            <IncidentPriorityBadge priority={incident.priority} />
            <IncidentStatusBadge status={incident.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{incident.description}</p>
        
        <div className="flex items-center mt-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="truncate">{incident.location.address}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between border-t text-xs text-muted-foreground">
        <div>
          Reported: {format(new Date(incident.reportedAt), 'MMM d, h:mm a')}
        </div>
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {incident.assignedOfficers.length}
        </div>
      </CardFooter>
    </Card>
  );
};

export default IncidentCard;
