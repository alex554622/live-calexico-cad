
import React, { useState } from 'react';
import { Incident } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Clock, FileText } from 'lucide-react';
import IncidentPriorityBadge from '@/components/common/IncidentPriorityBadge';
import IncidentStatusBadge from '@/components/common/IncidentStatusBadge';
import { format } from 'date-fns';

interface IncidentListProps {
  incidents: Incident[];
  isSelectionMode: boolean;
  selectedIncidents: string[];
  toggleIncidentSelection: (id: string, e: React.MouseEvent) => void;
  onSelectIncident: (incident: Incident) => void;
}

const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  isSelectionMode,
  selectedIncidents,
  toggleIncidentSelection,
  onSelectIncident,
}) => {
  if (incidents.length === 0) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center text-muted-foreground">
        <FileText className="h-12 w-12 mb-2" />
        <p>No incidents found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className={`p-4 hover:bg-muted rounded-md ${isSelectionMode ? 'cursor-default' : 'cursor-pointer'} transition-colors ${
            selectedIncidents.includes(incident.id) ? 'bg-muted' : ''
          }`}
          onClick={() => !isSelectionMode && onSelectIncident(incident)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isSelectionMode && (
                <Checkbox 
                  checked={selectedIncidents.includes(incident.id)} 
                  onCheckedChange={() => toggleIncidentSelection(incident.id, { stopPropagation: () => {} } as React.MouseEvent)}
                  onClick={(e) => e.stopPropagation()}
                  className="mr-2"
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{incident.title}</h3>
                  <IncidentPriorityBadge priority={incident.priority} />
                  <IncidentStatusBadge status={incident.status} />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{incident.description}</p>
              </div>
            </div>
            <div className="flex items-center text-xs text-muted-foreground gap-4">
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate max-w-[200px]">{incident.location.address}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{format(new Date(incident.reportedAt), 'MMM d, h:mm a')}</span>
              </div>
              {incident.documentLink && (
                <div className="flex items-center text-blue-500">
                  <FileText className="h-3 w-3 mr-1" />
                  <span>Doc</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IncidentList;
