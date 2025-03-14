
import { useState, useCallback, useEffect } from 'react';
import { Notification } from '@/types';
import { supabase } from '@/lib/supabase';

export function useNotificationData(toast: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch notifications',
          variant: 'destructive',
        });
        return;
      }
      
      // Transform the data to match our application's structure
      const formattedNotifications: Notification[] = data.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type as Notification['type'],
        timestamp: notification.timestamp,
        read: notification.read,
        relatedTo: notification.related_to_type ? {
          type: notification.related_to_type as 'officer' | 'incident' | 'user',
          id: notification.related_to_id,
        } : undefined,
      }));
      
      setNotifications(formattedNotifications);
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

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
      
      // Transform the data to match our application's structure
      const updatedNotification: Notification = {
        id: data.id,
        title: data.title,
        message: data.message,
        type: data.type as Notification['type'],
        timestamp: data.timestamp,
        read: data.read,
        relatedTo: data.related_to_type ? {
          type: data.related_to_type as 'officer' | 'incident' | 'user',
          id: data.related_to_id,
        } : undefined,
      };
      
      // Update the local state
      setNotifications(prev => 
        prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
      );
      
      return updatedNotification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  // Delete read notifications
  const deleteReadNotifications = async () => {
    try {
      // Count read notifications before deletion
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', true);
      
      if (countError) {
        console.error('Error counting read notifications:', countError);
        throw countError;
      }
      
      // Delete read notifications
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('read', true);
      
      if (error) {
        console.error('Error deleting read notifications:', error);
        throw error;
      }
      
      // Update the local state
      setNotifications(prev => prev.filter(n => !n.read));
      
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

  // Set up real-time subscription for notifications
  useEffect(() => {
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' }, 
        async () => {
          await fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    loadingNotifications,
    fetchNotifications,
    markNotificationAsRead,
    deleteReadNotifications
  };
}
