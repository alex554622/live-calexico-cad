
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
          username: 'avalladolid@calexico.ca.gov',
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
        .eq('username', email)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      console.log("User data from DB:", data);

      if (data) {
        const permissions: Record<string, boolean> = {};
        
        // Set default permissions based on role
        if (data.role === 'admin') {
          permissions.viewOfficerDetails = true;
          permissions.createOfficer = true;
          permissions.editOfficer = true;
          permissions.deleteOfficer = true;
          permissions.viewIncidentDetails = true;
          permissions.createIncident = true;
          permissions.editIncident = true;
          permissions.closeIncident = true;
          permissions.assignOfficer = true;
          permissions.manageSettings = true;
          permissions.viewReports = true;
          permissions.viewSettings = true;
          permissions.deleteIncident = true;
        } else if (data.role === 'supervisor') {
          permissions.viewOfficerDetails = true;
          permissions.createOfficer = true;
          permissions.editOfficer = true;
          permissions.viewIncidentDetails = true;
          permissions.createIncident = true;
          permissions.editIncident = true;
          permissions.closeIncident = true;
          permissions.assignOfficer = true;
          permissions.viewReports = true;
          permissions.viewSettings = true;
          permissions.manageSettings = true;
        } else if (data.role === 'dispatcher') {
          permissions.viewOfficerDetails = true;
          permissions.viewIncidentDetails = true;
          permissions.createIncident = true;
          permissions.editIncident = true;
          permissions.assignOfficer = true;
          permissions.viewSettings = true;
        } else if (data.role === 'officer') {
          permissions.viewOfficerDetails = true;
          permissions.viewIncidentDetails = true;
          permissions.createIncident = true;
        }
        
        // Add any custom permissions from the database
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
