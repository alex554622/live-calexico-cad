
import { User } from '../../types';
import { Permission } from './types';

/**
 * Checks if a user has a specific permission based on their role
 */
export const checkPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Dispatcher permissions
  if (user.role === 'dispatcher') {
    const dispatcherPermissions: Permission[] = [
      'viewOfficerDetails',
      'viewIncidentDetails',
      'createIncident',
      'editIncident',
      'assignOfficer',
      'viewReports',
      'deleteIncident',
      'viewSettings'  // Dispatchers can view settings
    ];
    return dispatcherPermissions.includes(permission);
  }
  
  // Supervisor permissions
  if (user.role === 'supervisor') {
    const supervisorPermissions: Permission[] = [
      'viewOfficerDetails',
      'viewIncidentDetails',
      'createIncident',
      'editIncident',
      'assignOfficer',
      'viewReports',
      'deleteIncident',
      'viewSettings',
      'manageSettings'  // Supervisors can manage settings
    ];
    return supervisorPermissions.includes(permission);
  }
  
  // Officer permissions - expanded to allow creating incidents and updating status
  if (user.role === 'officer') {
    const officerPermissions: Permission[] = [
      'viewOfficerDetails',
      'viewIncidentDetails',
      'createIncident',
      'updateOfficerStatus', // Allow officers to update their own status
      'editIncident'        // Allow officers to edit incidents
    ];
    return officerPermissions.includes(permission);
  }
  
  return false;
};
