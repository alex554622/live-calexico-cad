
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export const useFetchUser = () => {
  const fetchUserData = async (email: string | undefined) => {
    if (!email) {
      console.error("No email provided to fetchUserData");
      return null;
    }

    console.log("Fetching user data for email:", email);

    try {
      // For development purposes, we'll hardcode the admin user data
      if (email.toLowerCase() === 'avalladolid@calexico.ca.gov') {
        return {
          id: 'admin-id',
          username: 'avalladolid',
          name: 'Alex Valladolid',
          role: 'admin',
          permissions: {
            viewOfficerDetails: true,
            createOfficer: true,
            editOfficer: true,
            deleteOfficer: true,
            viewIncidentDetails: true,
            createIncident: true,
            editIncident: true,
            closeIncident: true,
            assignOfficer: true,
            manageSettings: true,
            viewReports: true,
            viewSettings: true,
            deleteIncident: true
          }
        } as User;
      }

      // For real users, fetch from database
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
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      console.log("User data from DB:", data);

      if (data) {
        const permissions: Record<string, boolean> = {};
        if (data.user_permissions) {
          data.user_permissions.forEach((p: { permission: string }) => {
            permissions[p.permission] = true;
          });
        }

        return {
          id: data.id,
          username: data.username,
          name: data.name,
          role: data.role,
          avatar: data.avatar,
          permissions
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      return null;
    }
  };

  return { fetchUserData };
};
