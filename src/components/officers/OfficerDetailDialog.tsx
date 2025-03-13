
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Officer, Incident } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';
import OfficerForm from '@/components/officers/OfficerForm';

interface OfficerDetailDialogProps {
  officer: Officer | null;
  incidents: Incident[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (officerId: string) => void;
  hasEditPermission: boolean;
  hasDeletePermission: boolean;
}

const OfficerDetailDialog: React.FC<OfficerDetailDialogProps> = ({
  officer,
  incidents,
  isOpen,
  onOpenChange,
  onDelete,
  hasEditPermission,
  hasDeletePermission
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!officer) return null;

  const handleEditSuccess = (updatedOfficer: Officer) => {
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{officer.name}</span>
            <div className="flex gap-2">
              {hasEditPermission && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  Edit
                </Button>
              )}
              {hasDeletePermission && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(officer.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              )}
            </div>
          </DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground">{officer.rank} • Badge #{officer.badgeNumber}</span>
            <OfficerStatusBadge status={officer.status} />
          </div>
        </DialogHeader>
        
        {isEditing ? (
          <OfficerForm 
            initialData={officer}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 py-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm">{officer.contactInfo?.phone || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{officer.contactInfo?.email || 'Not available'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Department</h3>
                <p className="text-sm">{officer.department}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Shift Schedule</h3>
                <p className="text-sm">{officer.shiftSchedule || "No shift scheduled"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                <p className="text-sm">{format(new Date(officer.lastUpdated), 'MMM d, h:mm a')}</p>
              </div>
              
              {officer.currentIncidentId && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Current Incident</h3>
                  <div className="text-sm p-3 bg-muted rounded-md">
                    {incidents.find(i => i.id === officer.currentIncidentId)?.title || 'Loading...'}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="incidents">
              <div className="py-4">
                <h3 className="text-sm font-medium mb-3">Incident History</h3>
                
                {incidents.filter(incident => 
                  incident.assignedOfficers.includes(officer.id)
                ).length > 0 ? (
                  <div className="space-y-3">
                    {incidents
                      .filter(incident => incident.assignedOfficers.includes(officer.id))
                      .map(incident => (
                        <div key={incident.id} className="border rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{incident.title}</h4>
                              <p className="text-xs text-muted-foreground">{incident.location.address}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{format(new Date(incident.reportedAt), 'MMM d')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No incident history found for this officer
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OfficerDetailDialog;
