
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
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
    const checkAuth = async () => {
      try {
        setLoading(true);
        console.log("Checking authentication status...");
        
        // Get current user from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth status:', error);
          return;
        }
        
        if (session) {
          console.log('Session found:', session.user.id);
          
          // Get user profile from our profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            return;
          }
          
          if (profile) {
            console.log('User profile found:', profile.name);
            setUser({
              id: profile.id,
              username: profile.username,
              name: profile.name,
              role: profile.role as User['role'],
              avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1E40AF&color=fff`,
              permissions: profile.permissions as any
            });
          }
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error('Error in checkAuth:', error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        setLoading(true);
        
        // Get user profile from our profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setLoading(false);
          return;
        }
        
        if (profile) {
          console.log('Profile data on sign in:', profile);
          setUser({
            id: profile.id,
            username: profile.username,
            name: profile.name,
            role: profile.role as User['role'],
            avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1E40AF&color=fff`,
            permissions: profile.permissions as any
          });
        }
        setLoading(false);
      }
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    checkAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, retainData = false) => {
    try {
      setLoading(true);
      console.log('Attempting login with email:', email);
      
      // Clear any previous session data to avoid conflicts
      console.log('Clearing previous session data');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email, 
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      if (data.session) {
        console.log('Login successful, session:', data.session.user.id);
        
        // Store data retention preference
        localStorage.setItem('dataRetention', retainData ? 'true' : 'false');
        
        // Double check that we have a user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching user profile after login:', profileError);
        } else if (profile) {
          console.log('User profile loaded:', profile.name);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      
      // If data retention is not enabled, clear local storage
      const retainData = localStorage.getItem('dataRetention') === 'true';
      if (!retainData) {
        // Clear only authentication data, not all settings
        localStorage.removeItem('authToken');
        // Keep retentionSettings, dataRetention, etc.
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error logging out",
        description: "An error occurred while logging out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a function to update the current user in the context
  const updateCurrentUser = async (updatedUser: User) => {
    if (!user) return;
    
    try {
      // Update the user profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedUser.name,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          permissions: updatedUser.permissions
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error updating user",
        description: "An error occurred while updating user information.",
        variant: "destructive"
      });
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
