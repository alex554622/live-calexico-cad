
import { Officer, Incident, Notification, User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'jdoe',
    name: 'John Doe',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=1E40AF&color=fff',
  },
  {
    id: '2',
    username: 'ssmith',
    name: 'Sarah Smith',
    role: 'dispatcher',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Smith&background=1E40AF&color=fff',
  },
  {
    id: '3',
    username: 'mjohnson',
    name: 'Mike Johnson',
    role: 'supervisor',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=1E40AF&color=fff',
  },
];

export const mockOfficers: Officer[] = [
  {
    id: '1',
    badgeNumber: 'CPD-1234',
    name: 'Officer Rodriguez',
    rank: 'Patrol Officer',
    department: 'Central',
    status: 'available',
    location: {
      lat: 32.6789,
      lng: -115.4989,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    badgeNumber: 'CPD-2345',
    name: 'Officer Martinez',
    rank: 'Sergeant',
    department: 'East',
    status: 'busy',
    location: {
      lat: 32.6795,
      lng: -115.4930,
    },
    currentIncidentId: '2',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    badgeNumber: 'CPD-3456',
    name: 'Officer Peterson',
    rank: 'Patrol Officer',
    department: 'West',
    status: 'responding',
    location: {
      lat: 32.6748,
      lng: -115.5010,
    },
    currentIncidentId: '1',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '4',
    badgeNumber: 'CPD-4567',
    name: 'Officer Thompson',
    rank: 'Detective',
    department: 'Criminal Investigations',
    status: 'busy',
    location: {
      lat: 32.6770,
      lng: -115.4950,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '5',
    badgeNumber: 'CPD-5678',
    name: 'Officer Garcia',
    rank: 'Patrol Officer',
    department: 'South',
    status: 'available',
    location: {
      lat: 32.6720,
      lng: -115.4970,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '6',
    badgeNumber: 'CPD-6789',
    name: 'Officer Williams',
    rank: 'Lieutenant',
    department: 'North',
    status: 'offDuty',
    lastUpdated: new Date().toISOString(),
  },
];

export const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Vehicle Collision',
    description: 'Two-vehicle collision with minor injuries reported',
    location: {
      address: '123 Main St, Calexico, CA',
      lat: 32.6789,
      lng: -115.4989,
    },
    priority: 'high',
    status: 'active',
    assignedOfficers: ['3'],
    reportedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
    reportedBy: '2', // Sarah Smith
  },
  {
    id: '2',
    title: 'Disturbance at Local Store',
    description: 'Verbal altercation reported at convenience store',
    location: {
      address: '456 Elm St, Calexico, CA',
      lat: 32.6795,
      lng: -115.4930,
    },
    priority: 'medium',
    status: 'active',
    assignedOfficers: ['2'],
    reportedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    reportedBy: '2', // Sarah Smith
  },
  {
    id: '3',
    title: 'Suspicious Activity',
    description: 'Unknown individual loitering around closed business',
    location: {
      address: '789 Oak St, Calexico, CA',
      lat: 32.6748,
      lng: -115.5010,
    },
    priority: 'low',
    status: 'pending',
    assignedOfficers: [],
    reportedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
    reportedBy: '2', // Sarah Smith
  },
  {
    id: '4',
    title: 'Noise Complaint',
    description: 'Loud music reported at residential address',
    location: {
      address: '101 Pine St, Calexico, CA',
      lat: 32.6720,
      lng: -115.4970,
    },
    priority: 'low',
    status: 'resolved',
    assignedOfficers: ['5'],
    reportedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    reportedBy: '2', // Sarah Smith
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Officer Responding',
    message: 'Officer Peterson is responding to Vehicle Collision',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
    read: false,
    relatedTo: {
      type: 'officer',
      id: '3',
    },
  },
  {
    id: '2',
    title: 'New Incident Reported',
    message: 'Suspicious Activity has been reported at 789 Oak St',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    read: true,
    relatedTo: {
      type: 'incident',
      id: '3',
    },
  },
  {
    id: '3',
    title: 'Incident Resolved',
    message: 'Noise Complaint has been resolved by Officer Garcia',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    read: true,
    relatedTo: {
      type: 'incident',
      id: '4',
    },
  },
];
