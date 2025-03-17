
import React from 'react';
import { Officer } from '@/types';
import AssignmentBlock from './AssignmentBlock';
import { useTouchDevice } from '@/hooks/use-touch-device';

interface AssignmentGridProps {
  assignments: string[];
  officers: Officer[];
  officerAssignments: Record<string, string[]>;
  onDrop: (e: React.DragEvent<HTMLDivElement>, assignmentId: string) => void;
  onOfficerDragStart: (e: React.DragEvent<HTMLDivElement>, officer: Officer) => void;
}

const AssignmentGrid: React.FC<AssignmentGridProps> = ({
  assignments,
  officers,
  officerAssignments,
  onDrop,
  onOfficerDragStart,
}) => {
  const isTouchDevice = useTouchDevice();
  
  const getAssignmentOfficers = (assignment: string) => {
    const officerIds = officerAssignments[assignment] || [];
    return officers.filter(officer => officerIds.includes(officer.id));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Assignments</h2>
      {isTouchDevice && (
        <div className="mb-3 text-sm text-muted-foreground">
          <p>Tap and hold officers to assign them to different locations.</p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-3" id="assignment-grid">
        {assignments.map((assignment) => (
          <AssignmentBlock
            key={assignment}
            title={assignment}
            officers={getAssignmentOfficers(assignment)}
            onDrop={onDrop}
            onDragStart={onOfficerDragStart}
          />
        ))}
      </div>
    </div>
  );
};

export default AssignmentGrid;
