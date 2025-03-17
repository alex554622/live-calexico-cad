
import React, { useEffect } from 'react';
import { useDashboard, ASSIGNMENTS } from '@/hooks/dashboard';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { useTouchDevice } from '@/hooks/use-touch-device';
import { useAuth } from '@/context/AuthContext';

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
  const { hasPermission } = useAuth();
  const canAssignOfficers = hasPermission('assignOfficer');
  
  // Add effect to periodically refresh the data
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [refreshData]);
  
  // Handle touch-specific events for the entire dashboard
  useEffect(() => {
    // Skip touch drag functionality if the user doesn't have assignOfficer permission
    if (!isTouchDevice || !canAssignOfficers) return;
    
    // Handle touch drop on assignment
    const handleTouchDrop = (e: CustomEvent) => {
      const { officerId, assignmentId } = e.detail;
      
      if (officerId && assignmentId) {
        console.log(`Touch drop detected - Officer ${officerId} to assignment ${assignmentId}`);
        
        // Create a synthetic drop event
        const dropEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
          dataTransfer: {
            getData: (key: string) => key === 'officerId' ? officerId : null
          }
        } as unknown as React.DragEvent<HTMLDivElement>;
        
        handleOfficerDrop(dropEvent, assignmentId);
      }
    };
    
    // Handle drop back to officers list
    const handleTouchDropToList = (e: CustomEvent) => {
      const { officerId } = e.detail;
      
      if (officerId && handleOfficerDropToList) {
        console.log(`Touch drop to list - Officer ${officerId}`);
        
        // Create a synthetic drop event
        const dropEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
          dataTransfer: {
            getData: (key: string) => key === 'officerId' ? officerId : null
          }
        } as unknown as React.DragEvent<HTMLDivElement>;
        
        handleOfficerDropToList(dropEvent);
      }
    };
    
    // Clean up any lingering ghost elements on page navigation
    const cleanupGhostElements = () => {
      const ghost = document.getElementById('touch-drag-ghost');
      if (ghost && ghost.parentNode) {
        document.body.removeChild(ghost);
      }
      
      // Also clean up any stored data
      delete (window as any).touchDragOfficerId;
    };
    
    // Register event listeners
    window.addEventListener('touchdrop', handleTouchDrop as EventListener);
    window.addEventListener('touchdroptolist', handleTouchDropToList as EventListener);
    window.addEventListener('popstate', cleanupGhostElements);
    
    // Cleanup on component unmount
    return () => {
      window.removeEventListener('touchdrop', handleTouchDrop as EventListener);
      window.removeEventListener('touchdroptolist', handleTouchDropToList as EventListener);
      window.removeEventListener('popstate', cleanupGhostElements);
      cleanupGhostElements();
    };
  }, [isTouchDevice, handleOfficerDrop, handleOfficerDropToList, canAssignOfficers]);
  
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
      canAssignOfficers={canAssignOfficers}
    />
  );
};

export default Dashboard;
