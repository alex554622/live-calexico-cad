
import { Officer, OfficerStatus } from '@/types';
import { mockOfficers } from '../mockData';

// Simulating server-side data store
let officers = [...mockOfficers];

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
        officers = officers.filter(o => o.id !== id);
        resolve();
      } else {
        reject(new Error('Officer not found'));
      }
    }, 300);
  });
};

// Export the officers store for use in other services
export { officers };
