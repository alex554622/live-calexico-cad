
import { Officer, Incident, Notification } from '@/types';

export interface DataContextType {
  officers: Officer[];
  incidents: Incident[];
  notifications: Notification[];
  loadingOfficers: boolean;
  loadingIncidents: boolean;
  loadingNotifications: boolean;
  refreshData: () => Promise<void>;
  updateOfficerStatus: (officerId: string, status: Officer['status'], incidentId?: string) => Promise<Officer>;
  updateIncident: (incidentId: string, updates: Partial<Incident>) => Promise<Incident>;
  createIncident: (incident: Omit<Incident, 'id' | 'reportedAt' | 'updatedAt'>) => Promise<Incident>;
  assignOfficerToIncident: (incidentId: string, officerId: string) => Promise<{ incident: Incident; officer: Officer }>;
  markNotificationAsRead: (notificationId: string) => Promise<Notification>;
  createOfficer: (officer: Omit<Officer, 'id' | 'lastUpdated'>) => Promise<Officer>;
  updateOfficer: (officerId: string, updates: Partial<Officer>) => Promise<Officer>;
  deleteOfficer: (officerId: string) => Promise<void>;
  deleteIncident: (incidentId: string) => Promise<void>;
  deleteReadNotifications: () => Promise<number>;
}
