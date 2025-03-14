
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
    
    // Setup ghost element for touch dragging
    const handleTouchDragStart = (e: CustomEvent) => {
      const { officerId, name, x, y } = e.detail;
      
      // Create ghost element
      const ghost = document.createElement('div');
      ghost.className = 'fixed z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 opacity-90';
      ghost.innerHTML = `<div>${name}</div>`;
      ghost.id = 'touch-drag-ghost';
      ghost.style.position = 'fixed';
      ghost.style.left = `${x - 30}px`;
      ghost.style.top = `${y - 30}px`;
      ghost.style.width = '120px';
      ghost.style.pointerEvents = 'none';
      document.body.appendChild(ghost);
      
      // Store officer ID in window for reference
      (window as any).touchDragOfficerId = officerId;
    };
    
    const handleTouchDragMove = (e: CustomEvent) => {
      const { x, y } = e.detail;
      const ghost = document.getElementById('touch-drag-ghost');
      if (ghost) {
        ghost.style.left = `${x - 30}px`;
        ghost.style.top = `${y - 30}px`;
      }
    };
    
    const handleTouchDragEnd = () => {
      const ghost = document.getElementById('touch-drag-ghost');
      if (ghost) {
        document.body.removeChild(ghost);
      }
      delete (window as any).touchDragOfficerId;
    };
    
    // Register event listeners
    window.addEventListener('touchdragstart', handleTouchDragStart as EventListener);
    window.addEventListener('touchdragmove', handleTouchDragMove as EventListener);
    window.addEventListener('touchdragend', handleTouchDragEnd as EventListener);
    
    return () => {
      window.removeEventListener('touchdragstart', handleTouchDragStart as EventListener);
      window.removeEventListener('touchdragmove', handleTouchDragMove as EventListener);
      window.removeEventListener('touchdragend', handleTouchDragEnd as EventListener);
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
