
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';
import ExportIncidents from '@/components/incidents/ExportIncidents';

interface IncidentHeaderProps {
  hasCreatePermission: boolean;
  hasEditPermission: boolean;
  isSelectionMode: boolean;
  selectedCount: number;
  onCreateNew: () => void;
  onToggleSelectionMode: () => void;
  onDeleteSelected: () => void;
}

const IncidentHeader: React.FC<IncidentHeaderProps> = ({
  hasCreatePermission,
  hasEditPermission,
  isSelectionMode,
  selectedCount,
  onCreateNew,
  onToggleSelectionMode,
  onDeleteSelected,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground">
          View and manage all incidents in the system.
        </p>
      </div>
      <div className="flex gap-2">
        <ExportIncidents />
        
        {hasCreatePermission && (
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-1" /> New Incident
          </Button>
        )}
        {hasEditPermission && (
          <Button 
            variant={isSelectionMode ? "secondary" : "outline"} 
            onClick={onToggleSelectionMode}
          >
            <CheckSquare className="h-4 w-4 mr-1" /> 
            {isSelectionMode ? "Cancel Selection" : "Select Incidents"}
          </Button>
        )}
        {isSelectionMode && selectedCount > 0 && (
          <Button 
            variant="destructive" 
            onClick={onDeleteSelected}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
          </Button>
        )}
      </div>
    </div>
  );
};

export default IncidentHeader;
