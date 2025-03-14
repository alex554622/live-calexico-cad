
import React, { useEffect, useCallback } from 'react';
import { useDashboard, ASSIGNMENTS } from '@/hooks/dashboard';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { useTouchDevice } from '@/hooks/use-touch-device';
import { toast } from 'sonner';

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
    const handleTouchDrop = useCallback((e: CustomEvent) => {
      const { officerId, assignmentId } = e.detail;
      
      if (officerId && assignmentId) {
        console.log(`Touch drop - Officer ${officerId} to assignment ${assignmentId}`);
        
        // Create a synthetic drop event
        const dropEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
          dataTransfer: {
            getData: (key: string) => key === 'officerId' ? officerId : null
          }
        } as unknown as React.DragEvent<HTMLDivElement>;
        
        try {
          handleOfficerDrop(dropEvent, assignmentId);
          
          // Show success toast
          toast.success('Officer assigned successfully', {
            description: `Officer has been assigned to ${assignmentId}`
          });
        } catch (error) {
          console.error('Error dropping officer:', error);
          
          // Show error toast
          toast.error('Failed to assign officer', {
            description: 'Please try again'
          });
        }
      }
    }, [handleOfficerDrop]);
    
    // Handle drop back to officers list
    const handleTouchDropToList = useCallback((e: CustomEvent) => {
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
        
        try {
          handleOfficerDropToList(dropEvent);
          
          // Show success toast
          toast.success('Officer unassigned successfully', {
            description: 'Officer has been returned to available officers'
          });
        } catch (error) {
          console.error('Error dropping officer to list:', error);
          
          // Show error toast
          toast.error('Failed to unassign officer', {
            description: 'Please try again'
          });
        }
      }
    }, [handleOfficerDropToList]);
    
    // Handle drag start from assignment
    const handleTouchDragStartFromAssignment = useCallback((e: CustomEvent) => {
      const { officerId, assignmentId } = e.detail;
      
      if (officerId && assignmentId && handleOfficerDragStartFromAssignment) {
        console.log(`Touch drag start from assignment - Officer ${officerId} from ${assignmentId}`);
        
        try {
          // Call the drag start handler
          handleOfficerDragStartFromAssignment({
            dataTransfer: {
              setData: () => {},
              effectAllowed: 'move'
            }
          } as unknown as React.DragEvent<HTMLDivElement>, 
          { id: officerId } as any);
        } catch (error) {
          console.error('Error starting drag from assignment:', error);
        }
      }
    }, [handleOfficerDragStartFromAssignment]);
    
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
    window.addEventListener('touchdragstartfromassignment', handleTouchDragStartFromAssignment as EventListener);
    window.addEventListener('popstate', cleanupGhostElements);
    
    // Show a toast to guide users on touch devices
    if (isTouchDevice) {
      toast.info('Touch Drag & Drop Enabled', {
        description: 'Touch and hold an officer to assign them to a location',
        duration: 4000,
      });
    }
    
    // Cleanup on component unmount
    return () => {
      window.removeEventListener('touchdrop', handleTouchDrop as EventListener);
      window.removeEventListener('touchdroptolist', handleTouchDropToList as EventListener);
      window.removeEventListener('touchdragstartfromassignment', handleTouchDragStartFromAssignment as EventListener);
      window.removeEventListener('popstate', cleanupGhostElements);
      cleanupGhostElements();
    };
  }, [isTouchDevice, handleOfficerDrop, handleOfficerDropToList, handleOfficerDragStartFromAssignment]);
  
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
