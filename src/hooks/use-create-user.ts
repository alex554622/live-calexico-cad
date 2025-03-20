
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { signUp, createUserRecord } from '@/lib/supabase';
import { useData } from '@/context/data';
import { NewAccountFormData } from '@/types/user';
import { supabase } from "@/integrations/supabase/client";

export const useCreateUser = () => {
  const { toast } = useToast();
  const { createOfficer } = useData();
  const [isSaving, setIsSaving] = useState(false);

  const createSchedulingEmployee = async (userData: NewAccountFormData) => {
    try {
      const { data, error } = await supabase
        .from('employee_shifts')
        .insert({
          employee_id: userData.email,
          status: 'active'
        })
        .select();
      
      if (error) {
        console.error('Error creating employee shift record:', error);
      } else {
        console.log('Created employee shift record:', data);
      }
    } catch (error) {
      console.error('Error in createSchedulingEmployee:', error);
    }
  };

  const createAccounts = async (newAccounts: NewAccountFormData[]) => {
    if (newAccounts.length === 0) return false;
    
    setIsSaving(true);
    let success = true;

    try {
      for (const account of newAccounts) {
        if (!account.name || !account.email || !account.password || !account.role) {
          toast({
            title: 'Validation Error',
            description: 'All fields are required for new accounts',
            variant: 'destructive'
          });
          continue;
        }

        // Make sure the password meets Supabase requirements (min 6 chars)
        if (account.password.length < 6) {
          toast({
            title: 'Password Error',
            description: 'Password should be at least 6 characters long',
            variant: 'destructive'
          });
          continue;
        }

        const { data: authData, error: authError } = await signUp(
          account.email,
          account.password,
          {
            name: account.name,
            role: account.role,
          }
        );
        
        if (authError) {
          console.error('Error creating auth user:', authError);
          toast({
            title: 'Creation Failed',
            description: `Failed to create account for ${account.email}: ${authError.message}`,
            variant: 'destructive'
          });
          success = false;
          continue;
        }
        
        const userData = {
          username: account.email,
          name: account.name,
          role: account.role,
          // Include password for user record - this was in the original code
          password: account.password,
        };
        
        const { data, error } = await createUserRecord(userData);
        
        if (error) {
          console.error('Error creating user record:', error);
          toast({
            title: 'Creation Failed',
            description: `Failed to create user record for ${account.email}: ${error.message}`,
            variant: 'destructive'
          });
          success = false;
          continue;
        }

        // Create an employee for scheduling
        await createSchedulingEmployee(account);

        if (account.role === 'officer') {
          await createOfficer({
            badgeNumber: `CPD-${Math.floor(1000 + Math.random() * 9000)}`,
            name: account.name,
            rank: 'Patrol Officer',
            department: 'Central',
            status: 'available',
            contactInfo: {
              phone: '',
              email: account.email,
            },
            shiftSchedule: 'Mon-Fri 8am-4pm',
            location: {
              lat: 32.6789,
              lng: -115.4989,
            }
          });
        }
        
        toast({
          title: 'Account Created',
          description: `Successfully created account for ${account.email}`,
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error creating accounts:', error);
      toast({
        title: 'Creation Failed',
        description: 'Failed to create one or more accounts',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { createAccounts, isSaving };
};
