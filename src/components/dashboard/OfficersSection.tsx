
import React from 'react';
import { Officer } from '@/types';
import { useOfficerDropZone } from '@/hooks/dashboard/use-officer-drop-zone';
import OfficersHeader from './officer-section/OfficersHeader';
import EmptyOfficersList from './officer-section/EmptyOfficersList';
import OfficersGrid from './officer-section/OfficersGrid';

interface OfficersSectionProps {
  officers: Officer[];
  assignedOfficerIds: string[];
  onOfficerClick: (officer: Officer) => void;
  onOfficerDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  canDragDrop?: boolean;
}

const OfficersSection: React.FC<OfficersSectionProps> = ({
  officers,
  assignedOfficerIds,
  onOfficerClick,
  onOfficerDrop,
  canDragDrop = true,
}) => {
  const {
    isDragOver,
    isTouchOver,
    sectionRef,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useOfficerDropZone(onOfficerDrop);
  
  // Filter out officers that are already assigned to an assignment
  const availableOfficers = officers.filter(
    officer => !assignedOfficerIds.includes(officer.id)
  );

  return (
    <div>
      <OfficersHeader />
      <div 
        ref={sectionRef}
        onDragOver={canDragDrop && onOfficerDrop ? handleDragOver : undefined}
        onDragLeave={canDragDrop && onOfficerDrop ? handleDragLeave : undefined}
        onDrop={canDragDrop && onOfficerDrop ? handleDrop : undefined}
        className={`border-2 border-dashed rounded-lg p-2 transition-colors duration-200
          ${(isDragOver || isTouchOver) 
            ? 'border-primary bg-primary/10' 
            : 'border-transparent hover:border-muted-foreground'}`}
        data-drop-target="officers-list"
      >
        {availableOfficers.length === 0 ? (
          <EmptyOfficersList />
        ) : (
          <OfficersGrid 
            officers={availableOfficers} 
            onOfficerClick={onOfficerClick}
            draggable={canDragDrop} 
          />
        )}
      </div>
    </div>
  );
};

export default OfficersSection;
