
import { useData } from '@/context/data';
import { useDashboardSelection } from './use-dashboard-selection';
import { useOfficerAssignments } from './use-officer-assignments';
import { useOfficerAssignmentOperations } from './use-officer-assignment-operations';
import { ASSIGNMENTS } from './constants';
import { useState, useCallback } from 'react';

export { ASSIGNMENTS } from './constants';

/**
 * Main dashboard hook that combines all dashboard functionality
 */
export function useDashboard() {
  const { officers, updateOfficer } = useData();
  
  // Local optimistic state for immediate UI updates
  const [optimisticAssignments, setOptimisticAssignments] = useState<Record<string, string[]>>({});
  const [hasOptimisticChanges, setHasOptimisticChanges] = useState(false);
  
  // Get selection state
  const selection = useDashboardSelection();
  
  // Get assignments data
  const assignments = useOfficerAssignments();
  
  // Merge real assignments with optimistic ones
  const mergedAssignments = hasOptimisticChanges 
    ? optimisticAssignments 
    : assignments.officerAssignments;
  
  // Update the optimistic state whenever real data changes
  if (!hasOptimisticChanges && assignments.officerAssignments !== optimisticAssignments) {
    setOptimisticAssignments(assignments.officerAssignments);
  }
  
  // Create our own update function for optimistic updates
  const updateAssignmentOptimistically = useCallback((officerId: string, assignmentId: string | null) => {
    setHasOptimisticChanges(true);
    
    setOptimisticAssignments(prev => {
      const newAssignments = { ...prev };
      
      // Remove officer from any current assignment
      Object.keys(newAssignments).forEach(assignment => {
        newAssignments[assignment] = newAssignments[assignment].filter(id => id !== officerId);
      });
      
      // Add officer to new assignment if not null
      if (assignmentId) {
        if (!newAssignments[assignmentId]) {
          newAssignments[assignmentId] = [];
        }
        newAssignments[assignmentId] = [...newAssignments[assignmentId], officerId];
      }
      
      return newAssignments;
    });
    
    // Reset optimistic state after a successful update from the server
    setTimeout(() => {
      setHasOptimisticChanges(false);
    }, 2000);
  }, []);
  
  // Get assignment operations with needed dependencies
  const operations = useOfficerAssignmentOperations(
    assignments.refreshData,
    updateOfficer,
    officers,
    updateAssignmentOptimistically
  );
  
  // Calculate all assigned officer IDs from the merged assignments
  const allAssignedOfficerIds = Object.values(mergedAssignments).flat();
  
  // Combine all the pieces into a unified dashboard API
  return {
    ...selection,
    ...assignments,
    ...operations,
    officerAssignments: mergedAssignments,
    allAssignedOfficerIds,
  };
}
