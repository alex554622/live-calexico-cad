
import React from 'react';
import { Officer, Incident } from '@/types';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';

interface OfficerDetailsDialogProps {
  officer: Officer | null;
  incidents: Incident[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OfficerDetailsDialog: React.FC<OfficerDetailsDialogProps> = ({
  officer,
  incidents,
  open,
  onOpenChange,
}) => {
  if (!officer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Officer Details</DialogTitle>
          <DialogDescription>
            Information about {officer.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-police text-white flex items-center justify-center font-bold text-lg">
              {officer.name.split(' ')[0][0] + (officer.name.split(' ')[1]?.[0] || '')}
            </div>
            <div>
              <h3 className="font-medium">{officer.name}</h3>
              <p className="text-sm text-muted-foreground">{officer.rank}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Badge Number</p>
              <p className="text-sm">{officer.badgeNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Department</p>
              <p className="text-sm">{officer.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <OfficerStatusBadge status={officer.status} />
            </div>
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-sm">{format(new Date(officer.lastUpdated), 'h:mm a')}</p>
            </div>
          </div>
          
          {officer.currentIncidentId && (
            <div>
              <p className="text-sm font-medium">Current Incident</p>
              <p className="text-sm">{
                incidents.find(i => i.id === officer.currentIncidentId)?.title || 'Unknown'
              }</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfficerDetailsDialog;
