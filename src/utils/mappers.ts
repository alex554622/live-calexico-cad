
import { Officer, Incident, Notification } from '@/types';

export const mapDbOfficerToAppOfficer = (dbOfficer: any): Officer => {
  return {
    id: dbOfficer.id,
    name: dbOfficer.name,
    rank: dbOfficer.rank,
    badgeNumber: dbOfficer.badge_number,
    status: dbOfficer.status,
    department: dbOfficer.department,
    shiftSchedule: dbOfficer.shift_schedule,
    currentIncidentId: dbOfficer.current_incident_id,
    lastUpdated: dbOfficer.last_updated,
    contactInfo: dbOfficer.contact_info
  };
};

export const mapDbIncidentToAppIncident = (dbIncident: any): Incident => {
  return {
    id: dbIncident.id,
    title: dbIncident.title,
    description: dbIncident.description,
    status: dbIncident.status,
    priority: dbIncident.priority,
    location: dbIncident.location,
    reportedAt: dbIncident.reported_at,
    updatedAt: dbIncident.updated_at,
    assignedOfficers: dbIncident.assigned_officers || [],
    type: dbIncident.type || 'general',
    reportedBy: dbIncident.reported_by || 'Unknown'
  };
};

export const mapDbNotificationToAppNotification = (dbNotification: any): Notification => {
  return {
    id: dbNotification.id,
    title: dbNotification.title,
    message: dbNotification.message,
    type: dbNotification.type,
    timestamp: dbNotification.timestamp,
    read: dbNotification.read,
    relatedTo: dbNotification.related_to
  };
};
