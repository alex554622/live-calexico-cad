
import React from 'react';
import { Officer, Incident } from '@/types';
import { Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';

interface OfficerCardProps {
  officer: Officer;
  isSelectionMode: boolean;
  isSelected: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onClick: () => void;
  onStatusUpdate: (officer: Officer, e: React.MouseEvent) => void;
  currentIncident: Incident | null;
  hasEditPermission: boolean;
}

const OfficerCard: React.FC<OfficerCardProps> = ({
  officer,
  isSelectionMode,
  isSelected,
  onSelect,
  onClick,
  onStatusUpdate,
  currentIncident,
  hasEditPermission
}) => {
  return (
    <div
      className={`border rounded-lg overflow-hidden hover:border-primary transition-colors ${
        isSelectionMode ? 'cursor-default' : 'cursor-pointer'
      } ${isSelected ? 'border-primary bg-primary/5' : ''}`}
      onClick={() => !isSelectionMode && onClick()}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {isSelectionMode && (
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={() => onSelect(officer.id, { stopPropagation: () => {} } as React.MouseEvent)}
                onClick={(e) => e.stopPropagation()}
                className="mr-2"
              />
            )}
            <div>
              <h3 className="font-medium">{officer.name}</h3>
              <p className="text-sm text-muted-foreground">{officer.rank} • Badge #{officer.badgeNumber}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <OfficerStatusBadge status={officer.status} />
            {hasEditPermission && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-7"
                onClick={(e) => onStatusUpdate(officer, e)}
              >
                Update Status
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{officer.contactInfo?.phone || 'No phone available'}</span>
          </div>
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{officer.contactInfo?.email || 'No email available'}</span>
          </div>
        </div>
        
        {currentIncident && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium">Current Incident:</p>
            <p className="text-sm truncate">{currentIncident.title}</p>
            <p className="text-xs text-muted-foreground">{currentIncident.location.address}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerCard;
