
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../services/api';

// Define the permission types
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
  | 'deleteIncident';  // Added deleteIncident permission

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const user = await apiLogin(username, password);
      if (user) {
        setUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (permission: Permission) => {
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
        'deleteIncident'  // Added deleteIncident permission for dispatchers
      ];
      return dispatcherPermissions.includes(permission);
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
