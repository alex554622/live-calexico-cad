
import { useState, useCallback, useEffect } from 'react';
import { ASSIGNMENTS } from './constants';
import { useFetchAssignments } from './use-fetch-assignments';
import { useAssignmentSubscription } from './use-assignment-subscription';

/**
 * Hook for fetching and handling officer assignments
 */
export function useOfficerAssignments() {
  const [officerAssignments, setOfficerAssignments] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  // Get all assigned officer IDs across all assignments
  const allAssignedOfficerIds = Object.values(officerAssignments).flat();
  
  // Function to refresh the data
  const refreshData = useCallback(() => {
    setLastRefresh(Date.now());
  }, []);
  
  // Get the fetch function from our custom hook
  const fetchAssignments = useFetchAssignments();
  
  // Wrapped fetch function to update state
  const fetchOfficerAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const assignments = await fetchAssignments();
      setOfficerAssignments(assignments);
    } finally {
      setLoading(false);
    }
  }, [fetchAssignments]);

  // Subscribe to real-time changes
  useAssignmentSubscription(fetchOfficerAssignments, refreshData);
  
  // Initial data fetch
  useEffect(() => {
    fetchOfficerAssignments();
  }, [fetchOfficerAssignments]);

  return {
    officerAssignments,
    allAssignedOfficerIds,
    loading,
    lastRefresh,
    refreshData,
    fetchOfficerAssignments,
  };
}
