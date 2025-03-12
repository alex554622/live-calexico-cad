import { Officer, Incident, Notification, User, OfficerStatus } from '../types';
import { mockOfficers, mockIncidents, mockNotifications, mockUsers } from './mockData';

// Simulating server-side data store
let officers = [...mockOfficers];
let incidents = [...mockIncidents];
let notifications = [...mockNotifications];
let users: User[] = [
  {
    id: '1',
    username: 'alexvalla',
    name: 'Administrator',
    role: 'admin',
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

// New function to update user information
export const updateUser = (id: string, updates: Partial<User>): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          ...updates,
        };
        
        // If this is the current user, update currentUser as well
        if (currentUser && currentUser.id === id) {
          currentUser = { ...users[userIndex] };
        }
        
        // Create a notification
        const newNotification: Notification = {
          id: String(notifications.length + 1),
          title: 'User Updated',
          message: `${users[userIndex].name}'s information has been updated`,
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
          relatedTo: {
            type: 'user',
            id
          }
        };
        
        notifications = [newNotification, ...notifications];
        
        resolve(users[userIndex]);
      } else {
        throw new Error('User not found');
      }
    }, 500);
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

export const deleteOfficer = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const officerIndex = officers.findIndex(o => o.id === id);
      if (officerIndex !== -1) {
        // Get the officer to be deleted
        const officerToDelete = officers[officerIndex];
        
        // Remove the officer from the data store
        officers = officers.filter(o => o.id !== id);
        
        // Create a notification
        const newNotification: Notification = {
          id: String(notifications.length + 1),
          title: 'Officer Removed',
          message: `${officerToDelete.name} has been removed from the system`,
          type: 'warning',
          timestamp: new Date().toISOString(),
          read: false,
          relatedTo: {
            type: 'officer',
            id
          }
        };
        
        notifications = [newNotification, ...notifications];
        
        // Update any incidents that had this officer assigned
        incidents = incidents.map(incident => {
          if (incident.assignedOfficers.includes(id)) {
            return {
              ...incident,
              assignedOfficers: incident.assignedOfficers.filter(officerId => officerId !== id),
              updatedAt: new Date().toISOString()
            };
          }
          return incident;
        });
        
        resolve();
      } else {
        reject(new Error('Officer not found'));
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

// Incident related API
export const deleteIncident = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const incidentIndex = incidents.findIndex(i => i.id === id);
      if (incidentIndex !== -1) {
        // Get the incident to be deleted
        const incidentToDelete = incidents[incidentIndex];
        
        // Remove the incident from the data store
        incidents = incidents.filter(i => i.id !== id);
        
        // Create a notification
        const newNotification: Notification = {
          id: String(notifications.length + 1),
          title: 'Incident Removed',
          message: `${incidentToDelete.title} has been removed from the system`,
          type: 'warning',
          timestamp: new Date().toISOString(),
          read: false,
          relatedTo: {
            type: 'incident',
            id
          }
        };
        
        notifications = [newNotification, ...notifications];
        
        // Update any officers assigned to this incident
        officers = officers.map(officer => {
          if (officer.currentIncidentId === id) {
            return {
              ...officer,
              status: 'available' as OfficerStatus,
              currentIncidentId: undefined,
              lastUpdated: new Date().toISOString()
            };
          }
          return officer;
        });
        
        resolve();
      } else {
        reject(new Error('Incident not found'));
      }
    }, 300);
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

export const deleteReadNotifications = (): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialCount = notifications.length;
      notifications = notifications.filter(n => !n.read);
      const deletedCount = initialCount - notifications.length;
      resolve(deletedCount);
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
