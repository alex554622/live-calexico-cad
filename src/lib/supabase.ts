
import { createClient } from '@supabase/supabase-js';

// These values should be correct as provided in the environment
const supabaseUrl = 'https://rqeezagqtjmfliyuaytj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZWV6YWdxdGptZmxpeXVheXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODA0MzIsImV4cCI6MjA1NzM1NjQzMn0.pxsywLJHteT2YrkCRKCXmmjXkVwl1bCZp7g3mH_-P_U';

// Create supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to handle Supabase signup
export const signUp = async (email: string, password: string, userData?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
  
  return { data, error };
};

// Helper function to handle user data insertion
export const createUserRecord = async (userData: any) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select();
  
  return { data, error };
};

// Helper function to update user data
export const updateUserRecord = async (id: string, userData: any) => {
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', id)
    .select();
  
  return { data, error };
};

// Helper function to get all users
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  return { data, error };
};

// Helper function to delete a user
export const deleteUserRecord = async (id: string) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  
  return { error };
};
