import { useState, useEffect } from 'react';
import { User } from '../../types';
import { supabase } from '../../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

/**
 * Custom hook that contains the logic for the AuthProvider
 */
export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await fetchUserProfile(session);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchUserProfile(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (session: Session) => {
    try {
      // Fetch the user profile from the profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        throw error;
      }

      if (profile) {
        // Validate that the role is one of the accepted values
        const validRoles: User['role'][] = ['admin', 'dispatcher', 'supervisor', 'officer'];
        const role = validRoles.includes(profile.role as User['role']) 
          ? (profile.role as User['role']) 
          : 'officer'; // Default to officer if role is invalid
        
        // Transform the profile data to match our User type
        setUser({
          id: profile.id,
          username: profile.username,
          name: profile.name,
          role: role,
          avatar: profile.avatar
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (email: string, password: string, retainData = false) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data.user) {
        // Store data retention preference
        localStorage.setItem('dataRetention', retainData ? 'true' : 'false');
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
    }
  };

  // Add a function to update the current user in the context
  const updateCurrentUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return {
    user,
    loading,
    login,
    logout,
    updateCurrentUser
  };
};
