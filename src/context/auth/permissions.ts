
import { Permission } from './types';
import { User } from '@/types';

export const hasPermission = (user: User | null, permission: Permission): boolean => {
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
  
  // Officer permissions
  if (user.role === 'officer') {
    const officerPermissions: Permission[] = [
      'viewOfficerDetails',
      'viewIncidentDetails',
      'createIncident'
      // Note: 'viewSettings' is not included for officers
    ];
    return officerPermissions.includes(permission);
  }
  
  return false;
};
