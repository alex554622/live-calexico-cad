
import React, { useEffect } from 'react';
import { useDashboard, ASSIGNMENTS } from '@/hooks/dashboard';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { useTouchDevice } from '@/hooks/use-touch-device';

const Dashboard = () => {
  const {
    selectedOfficer,
    setSelectedOfficer,
    selectedIncident,
    setSelectedIncident,
    officerAssignments,
    allAssignedOfficerIds,
    loading,
    lastRefresh,
    refreshData,
    handleOfficerDrop,
    handleOfficerDragStartFromAssignment,
    handleOfficerDropOnIncident,
    handleOfficerDropToList
  } = useDashboard();
  
  const isTouchDevice = useTouchDevice();
  
  // Add effect to periodically refresh the data
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [refreshData]);
  
  // Handle touch-specific events for the entire dashboard
  useEffect(() => {
    if (!isTouchDevice) return;
    
    // Setup touch event handling for the entire dashboard
    const handleTouchStart = (e: TouchEvent) => {
      // Initialization of touch handling if needed
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isTouchDevice]);
  
  return (
    <DashboardContainer
      selectedOfficer={selectedOfficer}
      selectedIncident={selectedIncident}
      setSelectedOfficer={setSelectedOfficer}
      setSelectedIncident={setSelectedIncident}
      officerAssignments={officerAssignments}
      assignments={ASSIGNMENTS}
      allAssignedOfficerIds={allAssignedOfficerIds}
      loading={loading}
      lastRefresh={lastRefresh}
      refreshData={refreshData}
      handleOfficerDrop={handleOfficerDrop}
      handleOfficerDragStartFromAssignment={handleOfficerDragStartFromAssignment}
      handleOfficerDropOnIncident={handleOfficerDropOnIncident}
      handleOfficerDropToList={handleOfficerDropToList}
    />
  );
};

export default Dashboard;
