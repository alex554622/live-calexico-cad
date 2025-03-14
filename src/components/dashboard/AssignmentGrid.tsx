
import React from 'react';
import { Officer } from '@/types';
import AssignmentBlock from './AssignmentBlock';
import { useTouchDevice } from '@/hooks/use-touch-device';
import { toast } from 'sonner';

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
        <div className="mb-3 text-sm text-muted-foreground bg-muted p-2 rounded-md">
          <p><strong>Touch and hold</strong> officers to drag and assign them to different locations.</p>
          <p className="mt-1">Drag assigned officers back to the Officers list to unassign them.</p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-3">
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
