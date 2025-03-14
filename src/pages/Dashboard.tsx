
import React, { useEffect } from 'react';
import { useDashboard, ASSIGNMENTS } from '@/hooks/dashboard';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { useTouchDevice } from '@/hooks/use-touch-device';
import { toast } from '@/components/ui/use-toast';

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
    
    // Handle touch drop on assignment
    const handleTouchDrop = (e: CustomEvent) => {
      const { officerId, assignmentId } = e.detail;
      
      if (officerId && assignmentId) {
        console.log(`Touch drop - Officer ${officerId} to assignment ${assignmentId}`);
        
        try {
          // Create a synthetic drop event
          const dropEvent = {
            preventDefault: () => {},
            stopPropagation: () => {},
            dataTransfer: {
              getData: (key: string) => key === 'officerId' ? officerId : null
            }
          } as unknown as React.DragEvent<HTMLDivElement>;
          
          handleOfficerDrop(dropEvent, assignmentId);
          
          // Provide feedback for touch users
          toast({
            title: "Officer Assigned",
            description: `Officer assigned to ${assignmentId}`,
            duration: 2000,
          });
        } catch (error) {
          console.error("Error handling touch drop:", error);
          toast({
            title: "Assignment Failed",
            description: "Could not assign officer to this location",
            variant: "destructive",
          });
        }
      }
    };
    
    // Handle drop back to officers list
    const handleTouchDropToList = (e: CustomEvent) => {
      const { officerId } = e.detail;
      
      if (officerId && handleOfficerDropToList) {
        console.log(`Touch drop to list - Officer ${officerId}`);
        
        try {
          // Create a synthetic drop event
          const dropEvent = {
            preventDefault: () => {},
            stopPropagation: () => {},
            dataTransfer: {
              getData: (key: string) => key === 'officerId' ? officerId : null
            }
          } as unknown as React.DragEvent<HTMLDivElement>;
          
          handleOfficerDropToList(dropEvent);
          
          // Provide feedback for touch users
          toast({
            title: "Officer Unassigned",
            description: "Officer has been returned to the available list",
            duration: 2000,
          });
        } catch (error) {
          console.error("Error handling touch drop to list:", error);
          toast({
            title: "Unassignment Failed",
            description: "Could not unassign officer",
            variant: "destructive",
          });
        }
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
  }, [isTouchDevice, handleOfficerDrop, handleOfficerDropToList]);
  
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
