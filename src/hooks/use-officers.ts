
import { useState, useCallback } from 'react';
import { Officer } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { mapDbOfficerToAppOfficer } from '@/utils/mappers';

export const useOfficers = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const { toast } = useToast();

  const fetchOfficers = useCallback(async () => {
    try {
      setLoadingOfficers(true);
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .order('last_updated', { ascending: false });
        
      if (error) throw error;
      
      setOfficers(data.map(mapDbOfficerToAppOfficer));
    } catch (error) {
      console.error('Error fetching officers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch officers data',
        variant: 'destructive',
      });
    } finally {
      setLoadingOfficers(false);
    }
  }, [toast]);

  const createOfficer = async (officer: Omit<Officer, 'id' | 'lastUpdated'>) => {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('officers')
        .insert({
          name: officer.name,
          rank: officer.rank,
          badge_number: officer.badgeNumber,
          status: officer.status || 'available',
          department: officer.department,
          shift_schedule: officer.shiftSchedule,
          current_incident_id: officer.currentIncidentId,
          last_updated: now,
          contact_info: officer.contactInfo
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newOfficer = mapDbOfficerToAppOfficer(data);
      
      await supabase.from('notifications').insert({
        title: 'New Officer Added',
        message: `${newOfficer.name} has been added to the system`,
        type: 'info',
        timestamp: now,
        read: false,
        related_to: {
          type: 'officer',
          id: newOfficer.id
        }
      });
      
      return newOfficer;
    } catch (error) {
      console.error('Error creating officer:', error);
      toast({
        title: 'Error',
        description: 'Failed to create officer',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateOfficer = async (officerId: string, updates: Partial<Officer>) => {
    try {
      const now = new Date().toISOString();
      
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.rank) dbUpdates.rank = updates.rank;
      if (updates.badgeNumber) dbUpdates.badge_number = updates.badgeNumber;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.department) dbUpdates.department = updates.department;
      if (updates.shiftSchedule !== undefined) dbUpdates.shift_schedule = updates.shiftSchedule;
      if (updates.currentIncidentId !== undefined) dbUpdates.current_incident_id = updates.currentIncidentId;
      if (updates.contactInfo) dbUpdates.contact_info = updates.contactInfo;
      dbUpdates.last_updated = now;
      
      const { data, error } = await supabase
        .from('officers')
        .update(dbUpdates)
        .eq('id', officerId)
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedOfficer = mapDbOfficerToAppOfficer(data);
      
      await supabase.from('notifications').insert({
        title: 'Officer Updated',
        message: `${updatedOfficer.name}'s information has been updated`,
        type: 'info',
        timestamp: now,
        read: false,
        related_to: {
          type: 'officer',
          id: officerId
        }
      });
      
      return updatedOfficer;
    } catch (error) {
      console.error('Error updating officer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update officer',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteOfficer = async (officerId: string) => {
    try {
      const { data: officerData, error: getError } = await supabase
        .from('officers')
        .select()
        .eq('id', officerId)
        .single();
        
      if (getError) throw getError;
      
      const { error: deleteError } = await supabase
        .from('officers')
        .delete()
        .eq('id', officerId);
        
      if (deleteError) throw deleteError;
      
      await supabase.from('notifications').insert({
        title: 'Officer Removed',
        message: `${officerData.name} has been removed from the system`,
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        related_to: {
          type: 'officer',
          id: officerId
        }
      });
    } catch (error) {
      console.error('Error deleting officer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete officer',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    officers,
    loadingOfficers,
    fetchOfficers,
    createOfficer,
    updateOfficer,
    deleteOfficer
  };
};
