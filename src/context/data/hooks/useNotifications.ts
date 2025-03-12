
import { useState, useCallback } from 'react';
import { Notification } from '@/types';
import {
  getNotifications,
  markNotificationAsRead,
  deleteReadNotifications as apiDeleteReadNotifications
} from '@/services/notifications';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const data = await getNotifications();
      setNotifications(data);
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

  const markNotificationAsReadWrapper = async (notificationId: string) => {
    try {
      const updatedNotification = await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
      );
      return updatedNotification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const deleteReadNotificationsWrapper = async () => {
    try {
      const deletedCount = await apiDeleteReadNotifications();
      setNotifications(prev => prev.filter(n => !n.read));
      return deletedCount;
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
    markNotificationAsRead: markNotificationAsReadWrapper,
    deleteReadNotifications: deleteReadNotificationsWrapper,
  };
};
