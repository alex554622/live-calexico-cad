
import React, { createContext, useContext, useEffect } from 'react';
import { AuthContextType, Permission } from './types';
import { supabase } from '@/lib/supabase';
import { useAuthOperations } from './auth-operations';
import { hasPermission } from './permissions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user, setUser, 
    loading, setLoading, 
    login, logout, updateCurrentUser 
  } = useAuthOperations();

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
              role: profile.role as any,
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
            role: profile.role as any,
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
  }, [setLoading, setUser]);

  const handleHasPermission = (permission: Permission) => {
    return hasPermission(user, permission);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      hasPermission: handleHasPermission, 
      updateCurrentUser 
    }}>
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
