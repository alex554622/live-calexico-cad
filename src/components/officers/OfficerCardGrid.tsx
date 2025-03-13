
import React from 'react';
import { Officer, Incident } from '@/types';
import OfficerCard from './OfficerCard';

interface OfficerCardGridProps {
  loadingOfficers: boolean;
  filteredOfficers: Officer[];
  isSelectionMode: boolean;
  selectedOfficers: string[];
  toggleOfficerSelection: (id: string, e: React.MouseEvent) => void;
  setSelectedOfficer: (officer: Officer) => void;
  openStatusUpdateDialog: (officer: Officer, e?: React.MouseEvent) => void;
  getOfficerIncident: (officer: Officer) => Incident | null;
  hasEditPermission: boolean;
}

const OfficerCardGrid: React.FC<OfficerCardGridProps> = ({
  loadingOfficers,
  filteredOfficers,
  isSelectionMode,
  selectedOfficers,
  toggleOfficerSelection,
  setSelectedOfficer,
  openStatusUpdateDialog,
  getOfficerIncident,
  hasEditPermission
}) => {
  if (loadingOfficers) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p>Loading officers...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredOfficers.map(officer => (
        <OfficerCard
          key={officer.id}
          officer={officer}
          isSelectionMode={isSelectionMode}
          isSelected={selectedOfficers.includes(officer.id)}
          onSelect={toggleOfficerSelection}
          onClick={() => setSelectedOfficer(officer)}
          onStatusUpdate={openStatusUpdateDialog}
          currentIncident={getOfficerIncident(officer)}
          hasEditPermission={hasEditPermission}
        />
      ))}
    </div>
  );
};

export default OfficerCardGrid;
