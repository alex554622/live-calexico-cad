
import { useData } from '@/context/data';
import { useDashboardSelection } from './use-dashboard-selection';
import { useOfficerAssignments } from './use-officer-assignments';
import { useOfficerAssignmentOperations } from './use-officer-assignment-operations';
import { ASSIGNMENTS } from './constants';

export { ASSIGNMENTS } from './constants';

/**
 * Main dashboard hook that combines all dashboard functionality
 */
export function useDashboard() {
  const { officers, updateOfficer } = useData();
  
  // Get selection state
  const selection = useDashboardSelection();
  
  // Get assignments data
  const assignments = useOfficerAssignments();
  
  // Get assignment operations with needed dependencies
  const operations = useOfficerAssignmentOperations(
    assignments.refreshData,
    updateOfficer,
    officers
  );
  
  // Combine all the pieces into a unified dashboard API
  return {
    ...selection,
    ...assignments,
    ...operations,
  };
}
