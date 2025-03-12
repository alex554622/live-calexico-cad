
import { Incident, Officer } from '@/types';
import { mockIncidents } from '../mockData';
import { officers, updateOfficerStatus } from '../officers';

// Simulating server-side data store
let incidents = [...mockIncidents];

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
        
        // Update officer status to responding
        return updateOfficerStatus(officerId, 'responding', incidentId)
          .then(updatedOfficer => {
            resolve({ incident: updatedIncident, officer: updatedOfficer });
          });
      } else {
        throw new Error('Incident or Officer not found');
      }
    }, 500);
  });
};

export const deleteIncident = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const incidentIndex = incidents.findIndex(i => i.id === id);
      if (incidentIndex !== -1) {
        incidents = incidents.filter(i => i.id !== id);
        
        // Update any officers assigned to this incident
        officers.forEach(officer => {
          if (officer.currentIncidentId === id) {
            updateOfficerStatus(officer.id, 'available');
          }
        });
        
        resolve();
      } else {
        reject(new Error('Incident not found'));
      }
    }, 300);
  });
};
