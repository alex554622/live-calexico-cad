
export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'dispatcher' | 'supervisor' | 'officer';
  avatar?: string;
}

export type OfficerStatus = 'available' | 'busy' | 'responding' | 'offDuty';

export interface Officer {
  id: string;
  badgeNumber: string;
  name: string;
  rank: string;
  department: string;
  status: OfficerStatus;
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
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  relatedTo?: {
    type: 'officer' | 'incident';
    id: string;
  };
}
