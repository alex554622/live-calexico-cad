
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
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
  login: (username: string, password: string, retainData?: boolean) => Promise<boolean>;
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
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Check if there's an active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Fetch user data from the users table
          const { data: userData, error } = await supabase
            .from('users')
            .select(`
              id, 
              username, 
              name, 
              role, 
              avatar, 
              user_permissions(permission)
            `)
            .eq('username', session.user.email)
            .single();
          
          if (error) {
            console.error('Error fetching user data:', error);
            return;
          }
          
          if (userData) {
            // Transform permissions from array of objects to object with boolean values
            const permissions: Record<string, boolean> = {};
            if (userData.user_permissions) {
              userData.user_permissions.forEach((p: { permission: string }) => {
                permissions[p.permission] = true;
              });
            }
            
            setUser({
              id: userData.id,
              username: userData.username,
              name: userData.name,
              role: userData.role,
              avatar: userData.avatar,
              permissions
            });
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string, retainData = false) => {
    try {
      // For now, we're using a custom login that matches our existing users table
      // In a real implementation, you'd want to use Supabase Auth properly
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, 
          username, 
          name, 
          role, 
          avatar, 
          password,
          user_permissions(permission)
        `)
        .eq('username', username)
        .single();
      
      if (error || !data) {
        console.error('Login error:', error);
        return false;
      }
      
      // Check password (this is a simple check, in a real app you'd use proper hashing)
      if (data.password !== password) {
        return false;
      }
      
      // Transform permissions from array of objects to object with boolean values
      const permissions: Record<string, boolean> = {};
      if (data.user_permissions) {
        data.user_permissions.forEach((p: { permission: string }) => {
          permissions[p.permission] = true;
        });
      }
      
      // Set user in state
      setUser({
        id: data.id,
        username: data.username,
        name: data.name,
        role: data.role,
        avatar: data.avatar,
        permissions
      });
      
      // Store data retention preference
      localStorage.setItem('dataRetention', retainData ? 'true' : 'false');
      
      // Create a session for the user (in a real app, this would be handled by Supabase Auth)
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          user: {
            id: data.id,
            email: data.username
          }
        }
      }));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Clear local storage and state
      const retainData = localStorage.getItem('dataRetention') === 'true';
      if (!retainData) {
        localStorage.removeItem('supabase.auth.token');
      }
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add a function to update the current user in the context
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
