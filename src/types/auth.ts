
import { User } from './index';

export type Permission = 
  | 'viewOfficerDetails'
  | 'createOfficer'
  | 'editOfficer'
  | 'deleteOfficer'
  | 'viewIncidentDetails'
  | 'createIncident'
  | 'editIncident'
  | 'closeIncident'
  | 'assignOfficer'
  | 'manageSettings'
  | 'viewReports'
  | 'viewSettings'
  | 'deleteIncident';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, retainData?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  updateCurrentUser?: (updatedUser: User) => void;
}
