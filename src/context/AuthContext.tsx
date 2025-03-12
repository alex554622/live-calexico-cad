import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
  | 'viewSettings'
  | 'deleteIncident';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, retainData?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  updateCurrentUser?: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        name,
        role,
        avatar,
        user_permissions(permission)
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user data:', error);
      return;
    }

    if (data) {
      const permissions: Record<string, boolean> = {};
      if (data.user_permissions) {
        data.user_permissions.forEach((p: { permission: string }) => {
          permissions[p.permission] = true;
        });
      }

      setUser({
        id: data.id,
        username: data.username,
        name: data.name,
        role: data.role,
        avatar: data.avatar,
        permissions
      });
    }
  };

  const login = async (email: string, password: string, retainData = false) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Store retention preference
      localStorage.setItem('dataRetention', retainData ? 'true' : 'false');
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      
      // Clear local storage if data retention is not enabled
      const retainData = localStorage.getItem('dataRetention') === 'true';
      if (!retainData) {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateCurrentUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const hasPermission = (permission: Permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check user permissions
    if (user.permissions && user.permissions[permission as string]) {
      return true;
    }
    
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
        'viewSettings'
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, updateCurrentUser }}>
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
