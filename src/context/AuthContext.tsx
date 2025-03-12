
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import { AuthContextType, Permission } from '@/types/auth';
import { usePermissions } from '@/hooks/use-permissions';
import { useFetchUser } from '@/hooks/use-fetch-user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = usePermissions(user);
  const { fetchUserData } = useFetchUser();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      if (session?.user) {
        fetchAndSetUser(session.user.email);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session);
      if (session?.user) {
        await fetchAndSetUser(session.user.email);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAndSetUser = async (email: string | undefined) => {
    const userData = await fetchUserData(email);
    if (userData) {
      setUser(userData);
    }
  };

  const login = async (email: string, password: string, retainData = false) => {
    try {
      console.log("Login attempt with:", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log("Supabase auth response:", { data, error });

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
