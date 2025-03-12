import { useState } from 'react';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useAuthOperations = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const login = async (email: string, password: string, retainData = false) => {
    console.log('Login function called with email:', email);
    try {
      setLoading(true);
      
      if (!email || !password) {
        console.error('Email or password is missing');
        return false;
      }
      
      console.log('Attempting Supabase signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email, 
        password
      });
      
      if (error) {
        console.error('Login error from Supabase:', error.message);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Supabase auth response:', data ? 'Success' : 'No data');
      
      if (data.session) {
        console.log('Login successful, session established:', data.session.user.id);
        
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
          setUser({
            id: profile.id,
            username: profile.username,
            name: profile.name,
            role: profile.role as User['role'],
            avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1E40AF&color=fff`,
            permissions: profile.permissions as any
          });
        }
        
        return true;
      }
      
      console.error('No session returned from Supabase');
      return false;
    } catch (error) {
      console.error('Unexpected login error:', error);
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

  return {
    user,
    setUser,
    loading,
    setLoading,
    login,
    logout,
    updateCurrentUser
  };
};
