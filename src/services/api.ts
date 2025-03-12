import { Officer, Incident, Notification, User, OfficerStatus } from '../types';
import { mockOfficers, mockIncidents, mockNotifications, mockUsers } from './mockData';

// Simulating server-side data store
let officers = [...mockOfficers];
let incidents = [...mockIncidents];
let notifications = [...mockNotifications];
let users = [
  {
    id: '1',
    username: 'alexvalla',
    name: 'Administrator',
    role: 'admin' as const,
    avatar: 'https://ui-avatars.com/api/?name=Administrator&background=1E40AF&color=fff',
  }
];
let currentUser: User | null = null;

// Simulated authentication
export const login = (username: string, password: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check for our administrator account
      if (username === 'alexvalla' && password === '!345660312') {
        const user = users[0];
        currentUser = user;
        resolve(user);
      } else {
        resolve(null);
      }
    }, 800); // Simulate network delay
  });
};

export const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = null;
      resolve();
    }, 500);
  });
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(currentUser);
    }, 300);
  });
};

// Officer related API
export const getOfficers = (): Promise<Officer[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...officers]);
    }, 500);
  });
};

export const getOfficer = (id: string): Promise<Officer | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const officer = officers.find(o => o.id === id) || null;
      resolve(officer);
    }, 300);
  });
};

export const updateOfficerStatus = (
  id: string, 
  status: OfficerStatus, 
  incidentId?: string
): Promise<Officer> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const officerIndex = officers.findIndex(o => o.id === id);
      if (officerIndex !== -1) {
        officers[officerIndex] = {
          ...officers[officerIndex],
          status,
          currentIncidentId: incidentId,
          lastUpdated: new Date().toISOString()
        };
        
        // Create a notification
        const newNotification: Notification = {
          id: String(notifications.length + 1),
          title: 'Officer Status Updated',
          message: `${officers[officerIndex].name} is now ${status}`,
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
          relatedTo: {
            type: 'officer',
            id
          }
        };
        
        notifications = [newNotification, ...notifications];
        resolve(officers[officerIndex]);
      } else {
        throw new Error('Officer not found');
      }
    }, 300);
  });
};

export const createOfficer = (officer: Omit<Officer, 'id' | 'lastUpdated'>): Promise<Officer> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newOfficer: Officer = {
        ...officer,
        id: String(officers.length + 1),
        lastUpdated: new Date().toISOString()
      };
      
      officers = [newOfficer, ...officers];
      
      // Create a notification
      const newNotification: Notification = {
        id: String(notifications.length + 1),
        title: 'New Officer Added',
        message: `${newOfficer.name} has been added to the system`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        relatedTo: {
          type: 'officer',
          id: newOfficer.id
        }
      };
      
      notifications = [newNotification, ...notifications];
      
      resolve(newOfficer);
    }, 500);
  });
};

export const updateOfficer = (id: string, updates: Partial<Officer>): Promise<Officer> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const officerIndex = officers.findIndex(o => o.id === id);
      if (officerIndex !== -1) {
        officers[officerIndex] = {
          ...officers[officerIndex],
          ...updates,
          lastUpdated: new Date().toISOString()
        };
        
        // Create a notification
        const newNotification: Notification = {
          id: String(notifications.length + 1),
          title: 'Officer Updated',
          message: `${officers[officerIndex].name}'s information has been updated`,
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
          relatedTo: {
            type: 'officer',
            id
          }
        };
        
        notifications = [newNotification, ...notifications];
        
        resolve(officers[officerIndex]);
      } else {
        throw new Error('Officer not found');
      }
    }, 300);
  });
};

// Incident related API
export const getIncidents = (): Promise<Incident[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...incidents]);
    }, 500);
  });
};

export const getIncident = (id: string): Promise<Incident | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const incident = incidents.find(i => i.id === id) || null;
      resolve(incident);
    }, 300);
  });
};

export const createIncident = (incident: Omit<Incident, 'id' | 'reportedAt' | 'updatedAt'>): Promise<Incident> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newIncident: Incident = {
        ...incident,
        id: String(incidents.length + 1),
        reportedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      incidents = [newIncident, ...incidents];
      
      // Create a notification
      const newNotification: Notification = {
        id: String(notifications.length + 1),
        title: 'New Incident Reported',
        message: `${newIncident.title} at ${newIncident.location.address}`,
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        relatedTo: {
          type: 'incident',
          id: newIncident.id
        }
      };
      
      notifications = [newNotification, ...notifications];
      
      resolve(newIncident);
    }, 500);
  });
};

export const updateIncident = (id: string, updates: Partial<Incident>): Promise<Incident> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const incidentIndex = incidents.findIndex(i => i.id === id);
      if (incidentIndex !== -1) {
        incidents[incidentIndex] = {
          ...incidents[incidentIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        // Create a notification
        const newNotification: Notification = {
          id: String(notifications.length + 1),
          title: 'Incident Updated',
          message: `${incidents[incidentIndex].title} has been updated`,
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
          relatedTo: {
            type: 'incident',
            id
          }
        };
        
        notifications = [newNotification, ...notifications];
        
        resolve(incidents[incidentIndex]);
      } else {
        throw new Error('Incident not found');
      }
    }, 300);
  });
};

export const assignOfficerToIncident = (
  incidentId: string, 
  officerId: string
): Promise<{ incident: Incident; officer: Officer }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const incidentIndex = incidents.findIndex(i => i.id === incidentId);
      const officerIndex = officers.findIndex(o => o.id === officerId);
      
      if (incidentIndex !== -1 && officerIndex !== -1) {
        // Update incident
        const updatedIncident = {
          ...incidents[incidentIndex],
          assignedOfficers: [...new Set([...incidents[incidentIndex].assignedOfficers, officerId])],
          updatedAt: new Date().toISOString()
        };
        incidents[incidentIndex] = updatedIncident;
        
        // Update officer
        const updatedOfficer = {
          ...officers[officerIndex],
          status: 'responding' as OfficerStatus,
          currentIncidentId: incidentId,
          lastUpdated: new Date().toISOString()
        };
        officers[officerIndex] = updatedOfficer;
        
        // Create a notification
        const newNotification: Notification = {
          id: String(notifications.length + 1),
          title: 'Officer Assigned',
          message: `${updatedOfficer.name} assigned to ${updatedIncident.title}`,
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false,
          relatedTo: {
            type: 'incident',
            id: incidentId
          }
        };
        
        notifications = [newNotification, ...notifications];
        
        resolve({ incident: updatedIncident, officer: updatedOfficer });
      } else {
        throw new Error('Incident or Officer not found');
      }
    }, 500);
  });
};

// Notification related API
export const getNotifications = (): Promise<Notification[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...notifications]);
    }, 300);
  });
};

export const markNotificationAsRead = (id: string): Promise<Notification> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const notificationIndex = notifications.findIndex(n => n.id === id);
      if (notificationIndex !== -1) {
        notifications[notificationIndex] = {
          ...notifications[notificationIndex],
          read: true
        };
        resolve(notifications[notificationIndex]);
      } else {
        throw new Error('Notification not found');
      }
    }, 200);
  });
};

// Data retention policy - automatically removes incidents older than 3 days
const applyDataRetentionPolicy = () => {
  const threeDAysAgo = new Date();
  threeDAysAgo.setDate(threeDAysAgo.getDate() - 3);
  
  incidents = incidents.filter(incident => {
    const reportedAt = new Date(incident.reportedAt);
    return reportedAt >= threeDAysAgo;
  });
};

// Apply data retention policy every 12 hours
setInterval(applyDataRetentionPolicy, 12 * 60 * 60 * 1000);

// Function to export incidents to CSV format (for Google Sheets)
export const exportIncidentsToCSV = (): string => {
  // Define CSV headers
  const headers = ['ID', 'Title', 'Description', 'Address', 'Priority', 'Status', 'Reported At', 'Updated At'];
  
  // Convert incidents to CSV rows
  const rows = incidents.map(incident => [
    incident.id,
    `"${incident.title.replace(/"/g, '""')}"`,
    `"${incident.description.replace(/"/g, '""')}"`,
    `"${incident.location.address.replace(/"/g, '""')}"`,
    incident.priority,
    incident.status,
    incident.reportedAt,
    incident.updatedAt
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

// Function to export incidents to a simple format that can be used in Google Docs
export const exportIncidentsToDoc = (): string => {
  let docContent = 'INCIDENT REPORT\n\n';
  
  incidents.forEach(incident => {
    docContent += `Incident ID: ${incident.id}\n`;
    docContent += `Title: ${incident.title}\n`;
    docContent += `Description: ${incident.description}\n`;
    docContent += `Location: ${incident.location.address}\n`;
    docContent += `Priority: ${incident.priority}\n`;
    docContent += `Status: ${incident.status}\n`;
    docContent += `Reported At: ${new Date(incident.reportedAt).toLocaleString()}\n`;
    docContent += `Updated At: ${new Date(incident.updatedAt).toLocaleString()}\n`;
    docContent += `Assigned Officers: ${incident.assignedOfficers.length}\n\n`;
    docContent += '-----------------------------\n\n';
  });
  
  return docContent;
};

// Create a new user with limited viewing permissions
export const createViewOnlyUser = (username: string, password: string, name: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser: User = {
        id: String(users.length + 1),
        username,
        name,
        role: 'officer',
        avatar: `https://ui-avatars.com/api/?name=${name.replace(/ /g, '+')}&background=1E40AF&color=fff`,
      };
      
      users.push(newUser);
      
      // Create a notification for new user
      const newNotification: Notification = {
        id: String(notifications.length + 1),
        title: 'New User Added',
        message: `${name} has been added as a view-only user`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      notifications = [newNotification, ...notifications];
      
      resolve(newUser);
    }, 500);
  });
};

// Get all users (for admin only)
export const getUsers = (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...users]);
    }, 300);
  });
};

// This is a utility function to simulate real-time updates in our demo
export const simulateRealTimeUpdates = (
  onOfficerUpdate: (officer: Officer) => void,
  onIncidentUpdate: (incident: Incident) => void,
  onNewNotification: (notification: Notification) => void
) => {
  const interval = setInterval(() => {
    const randomChoice = Math.random();
    
    if (randomChoice < 0.3) {
      // Update a random officer's status
      const randomOfficerIndex = Math.floor(Math.random() * officers.length);
      const officerToUpdate = officers[randomOfficerIndex];
      
      // Skip off-duty officers
      if (officerToUpdate.status === 'offDuty') return;
      
      const statusChoices: OfficerStatus[] = ['available', 'busy', 'responding'];
      const newStatus = statusChoices[Math.floor(Math.random() * statusChoices.length)];
      
      updateOfficerStatus(officerToUpdate.id, newStatus)
        .then(updatedOfficer => {
          onOfficerUpdate(updatedOfficer);
        });
    } else if (randomChoice < 0.5) {
      // Update an incident status
      const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'archived');
      
      if (activeIncidents.length > 0) {
        const randomIncidentIndex = Math.floor(Math.random() * activeIncidents.length);
        const incidentToUpdate = activeIncidents[randomIncidentIndex];
        
        const statusUpdate = Math.random() < 0.5 ? 'active' : 'resolved';
        
        updateIncident(incidentToUpdate.id, { status: statusUpdate as any })
          .then(updatedIncident => {
            onIncidentUpdate(updatedIncident);
            
            // If resolved, update assigned officers
            if (statusUpdate === 'resolved') {
              updatedIncident.assignedOfficers.forEach(officerId => {
                updateOfficerStatus(officerId, 'available')
                  .then(updatedOfficer => {
                    onOfficerUpdate(updatedOfficer);
                  });
              });
            }
          });
      }
    }
  }, 30000); // Simulate updates every 30 seconds
  
  return () => clearInterval(interval);
};
