
import React from 'react';
import { Incident, Officer } from '@/types';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IncidentPriorityBadge from '@/components/common/IncidentPriorityBadge';
import IncidentStatusBadge from '@/components/common/IncidentStatusBadge';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';

interface IncidentDetailsDialogProps {
  incident: Incident | null;
  officers: Officer[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IncidentDetailsDialog: React.FC<IncidentDetailsDialogProps> = ({
  incident,
  officers,
  open,
  onOpenChange,
}) => {
  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{incident.title}</DialogTitle>
          <div className="flex space-x-2 mt-2">
            <IncidentPriorityBadge priority={incident.priority} />
            <IncidentStatusBadge status={incident.status} />
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="officers">Assigned Officers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 py-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Description</h3>
              <p className="text-sm">{incident.description}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Location</h3>
              <p className="text-sm">{incident.location.address}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Reported At</h3>
                <p className="text-sm">{format(new Date(incident.reportedAt), 'MMM d, h:mm a')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                <p className="text-sm">{format(new Date(incident.updatedAt), 'MMM d, h:mm a')}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="officers">
            {incident.assignedOfficers.length > 0 ? (
              <div className="space-y-3 py-4">
                {incident.assignedOfficers.map(officerId => {
                  const officer = officers.find(o => o.id === officerId);
                  if (!officer) return null;
                  
                  return (
                    <div key={officer.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{officer.name}</p>
                        <p className="text-sm text-muted-foreground">{officer.rank}</p>
                      </div>
                      <OfficerStatusBadge status={officer.status} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No officers assigned to this incident
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDetailsDialog;
