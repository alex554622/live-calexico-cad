
import React, { useState } from 'react';
import { Incident, Officer } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { FileText, ExternalLink, Trash2 } from 'lucide-react';
import {
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import IncidentPriorityBadge from '@/components/common/IncidentPriorityBadge';
import IncidentStatusBadge from '@/components/common/IncidentStatusBadge';
import IncidentForm from '@/components/incidents/IncidentForm';

interface IncidentDetailViewProps {
  incident: Incident;
  officers: Officer[];
  loadingOfficers: boolean;
  onEdit: (updatedIncident: Incident) => void;
  onDelete: (incidentId: string) => void;
  onAssignOfficer: () => void;
}

const IncidentDetailView: React.FC<IncidentDetailViewProps> = ({
  incident,
  officers,
  loadingOfficers,
  onEdit,
  onDelete,
  onAssignOfficer,
}) => {
  const { hasPermission } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const openDocumentLink = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>{incident.title}</span>
          <div className="flex gap-2">
            {hasPermission('editIncident') && (
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
            {hasPermission('deleteIncident') && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(incident.id);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
          </div>
        </DialogTitle>
        <div className="flex space-x-2 mt-2">
          <IncidentPriorityBadge priority={incident.priority} />
          <IncidentStatusBadge status={incident.status} />
        </div>
      </DialogHeader>
      
      {isEditing ? (
        <IncidentForm 
          initialData={incident}
          onSuccess={(updatedIncident) => {
            setIsEditing(false);
            onEdit(updatedIncident);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="officers">Officers</TabsTrigger>
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
            
            {incident.documentLink && (
              <div>
                <h3 className="text-sm font-medium mb-1">Documentation</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center text-blue-600"
                  onClick={() => openDocumentLink(incident.documentLink)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View Document
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Reported At</h3>
                <p className="text-sm">{format(new Date(incident.reportedAt), 'MMM d, h:mm a')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                <p className="text-sm">{format(new Date(incident.updatedAt), 'MMM d, h:mm a')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Reported By</h3>
                <p className="text-sm">{incident.reportedBy}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="officers">
            {loadingOfficers ? (
              <div className="py-8 text-center">Loading officers...</div>
            ) : (
              <>
                {incident.assignedOfficers.length > 0 ? (
                  <div className="space-y-3 py-4">
                    {incident.assignedOfficers.map(officerId => {
                      const officer = officers.find(o => o.id === officerId);
                      if (!officer) return null;
                      
                      return (
                        <div key={officer.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div>
                            <p className="font-medium">{officer.name}</p>
                            <p className="text-sm text-muted-foreground">{officer.rank} • Badge #{officer.badgeNumber}</p>
                          </div>
                          <div className="flex items-center">
                            <span className={`h-2 w-2 rounded-full mr-2 ${
                              officer.status === 'available' ? 'bg-status-available' :
                              officer.status === 'responding' ? 'bg-status-responding' :
                              officer.status === 'busy' ? 'bg-status-busy' :
                              'bg-gray-400'
                            }`} />
                            <span className="text-sm">{
                              officer.status.charAt(0).toUpperCase() + officer.status.slice(1)
                            }</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No officers assigned to this incident
                  </div>
                )}
                
                {hasPermission('assignOfficer') && (
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={onAssignOfficer}
                    >
                      Assign Officers
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </>
  );
};

export default IncidentDetailView;
