import { Officer, Incident, Notification } from '@/types';
import { mockIncidents } from '../mockData';
import { mockOfficers } from '../mockData';
import { mockNotifications } from '../mockData';

// Get a local reference to the mock data for use in this module
let incidents = [...mockIncidents];
let officers = [...mockOfficers];

// Type definitions for the callback functions
type OfficerUpdateCallback = (officer: Officer) => void;
type IncidentUpdateCallback = (incident: Incident) => void;
type NotificationCallback = (notification: Notification) => void;

/**
 * Simulates real-time updates from the backend
 * @param onOfficerUpdate Callback when an officer is updated
 * @param onIncidentUpdate Callback when an incident is updated
 * @param onNewNotification Callback when a new notification is created
 * @returns Cleanup function
 */
export const simulateRealTimeUpdates = (
  onOfficerUpdate: OfficerUpdateCallback,
  onIncidentUpdate: IncidentUpdateCallback,
  onNewNotification: NotificationCallback
): () => void => {
  let officerUpdateInterval: NodeJS.Timeout;
  let incidentUpdateInterval: NodeJS.Timeout;
  let notificationInterval: NodeJS.Timeout;
  
  // Simulate officer status updates
  officerUpdateInterval = setInterval(() => {
    if (officers.length === 0) return;
    
    const randomOfficer = officers[Math.floor(Math.random() * officers.length)];
    const statuses: Officer['status'][] = ['available', 'busy', 'responding', 'offDuty'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    randomOfficer.status = randomStatus;
    onOfficerUpdate({ ...randomOfficer });
  }, 15000);
  
  // Simulate incident updates
  incidentUpdateInterval = setInterval(() => {
    if (incidents.length === 0) return;
    
    const randomIncident = incidents[Math.floor(Math.random() * incidents.length)];
    const statuses: Incident['status'][] = ['active', 'pending', 'resolved', 'archived'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    randomIncident.status = randomStatus;
    onIncidentUpdate({ ...randomIncident });
  }, 20000);
  
  // Simulate new notifications
  notificationInterval = setInterval(() => {
    const notificationTypes: Notification['type'][] = ['info', 'warning', 'error', 'success'];
    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    
    const newNotification: Notification = {
      id: String(mockNotifications.length + 1),
      title: `New ${randomType} Notification`,
      message: `This is a simulated ${randomType} notification.`,
      type: randomType,
      timestamp: new Date().toISOString(),
      read: false,
      relatedTo: {
        type: 'incident',
        id: incidents[0].id,
      },
    };
    
    mockNotifications.unshift(newNotification);
    onNewNotification(newNotification);
  }, 25000);
  
  return () => {
    clearInterval(officerUpdateInterval);
    clearInterval(incidentUpdateInterval);
    clearInterval(notificationInterval);
  };
};
