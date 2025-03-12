
import { useState, useCallback } from 'react';
import { Notification } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { mapDbNotificationToAppNotification } from '@/utils/mappers';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      
      setNotifications(data.map(mapDbNotificationToAppNotification));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive',
      });
    } finally {
      setLoadingNotifications(false);
    }
  }, [toast]);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select()
        .single();
        
      if (error) throw error;
      
      return mapDbNotificationToAppNotification(data);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const deleteReadNotifications = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', true);
        
      if (countError) throw countError;
      
      if (count === 0) return 0;
      
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('read', true);
        
      if (deleteError) throw deleteError;
      
      return count || 0;
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete read notifications',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    notifications,
    loadingNotifications,
    fetchNotifications,
    markNotificationAsRead,
    deleteReadNotifications
  };
};
