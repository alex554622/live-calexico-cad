
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../services/api';
import { User } from '../types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: keyof NonNullable<User['permissions']>) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPermissions = {
  admin: {
    createIncident: true,
    editIncident: true,
    assignOfficer: true,
    createUser: true,
    editUser: true,
    editOfficer: true,
    createOfficer: true,
    viewOfficerDetails: true,
    assignIncidentToOfficer: true,
  },
  supervisor: {
    createIncident: true,
    editIncident: true,
    assignOfficer: true,
    createUser: true,
    editUser: false,
    editOfficer: true,
    createOfficer: true,
    viewOfficerDetails: true,
    assignIncidentToOfficer: true,
  },
  dispatcher: {
    createIncident: true,
    editIncident: true,
    assignOfficer: true,
    createUser: false,
    editUser: false,
    editOfficer: false,
    createOfficer: false,
    viewOfficerDetails: true,
    assignIncidentToOfficer: true,
  },
  officer: {
    createIncident: false,
    editIncident: false,
    assignOfficer: false,
    createUser: false,
    editUser: false,
    editOfficer: false,
    createOfficer: false,
    viewOfficerDetails: false,
    assignIncidentToOfficer: false,
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // Attach default permissions based on role
          currentUser.permissions = defaultPermissions[currentUser.role];
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const loggedInUser = await apiLogin(username, password);
      
      if (loggedInUser) {
        // Attach default permissions based on role
        loggedInUser.permissions = defaultPermissions[loggedInUser.role];
        setUser(loggedInUser);
        
        toast({
          title: 'Login successful',
          description: `Welcome back, ${loggedInUser.name}!`,
        });
        return true;
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid username or password',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await apiLogout();
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout error',
        description: 'An error occurred during logout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: keyof NonNullable<User['permissions']>): boolean => {
    if (!user || !user.permissions) return false;
    return !!user.permissions[permission];
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
