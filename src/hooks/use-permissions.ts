
import { User } from '@/types';
import { Permission } from '@/types/auth';

export const usePermissions = (user: User | null) => {
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check user permissions
    if (user.permissions && user.permissions[permission]) {
      return true;
    }
    
    // Dispatcher permissions
    if (user.role === 'dispatcher') {
      const dispatcherPermissions: Permission[] = [
        'viewOfficerDetails',
        'viewIncidentDetails',
        'createIncident',
        'viewSettings'
        // Removed: 'editIncident', 'assignOfficer', 'deleteIncident'
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
        'manageSettings'
      ];
      return supervisorPermissions.includes(permission);
    }
    
    // Officer permissions
    if (user.role === 'officer') {
      const officerPermissions: Permission[] = [
        'viewOfficerDetails',
        'viewIncidentDetails',
        'createIncident'
      ];
      return officerPermissions.includes(permission);
    }
    
    return false;
  };

  return { hasPermission };
};
