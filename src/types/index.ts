export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'dispatcher' | 'supervisor' | 'officer';
  avatar?: string;
  permissions?: {
    viewOfficerDetails?: boolean;
    createOfficer?: boolean;
    editOfficer?: boolean;
    deleteOfficer?: boolean;
    viewIncidentDetails?: boolean;
    createIncident?: boolean;
    editIncident?: boolean;
    closeIncident?: boolean;
    assignOfficer?: boolean;
    manageSettings?: boolean;
    viewReports?: boolean;
    viewSettings?: boolean;
    deleteIncident?: boolean;
  };
}

export type OfficerStatus = 'available' | 'busy' | 'responding' | 'offDuty';

export interface Officer {
  id: string;
  badgeNumber: string;
  name: string;
  rank: string;
  department: string;
  status: OfficerStatus;
  contactInfo?: {
    phone: string;
    email: string;
  };
  shiftSchedule?: string;
  location?: {
    lat: number;
    lng: number;
  };
  currentIncidentId?: string;
  lastUpdated: string;
}

export type IncidentPriority = 'high' | 'medium' | 'low';
export type IncidentStatus = 'active' | 'pending' | 'resolved' | 'archived';

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  priority: IncidentPriority;
  status: IncidentStatus;
  assignedOfficers: string[];
  reportedAt: string;
  updatedAt: string;
  reportedBy: string;
  documentLink?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  relatedTo?: {
    type: 'officer' | 'incident' | 'user';
    id: string;
  };
}

export interface IncidentDocument {
  id: string;
  incidentId: string;
  filename: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  type: string;
}
