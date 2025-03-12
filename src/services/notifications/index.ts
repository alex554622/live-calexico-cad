
import { Notification } from '@/types';
import { mockNotifications } from '../mockData';

// Simulating server-side data store
let notifications = [...mockNotifications];

export const getNotifications = (): Promise<Notification[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...notifications]);
    }, 300);
  });
};

export const markNotificationAsRead = (id: string): Promise<Notification> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const notificationIndex = notifications.findIndex(n => n.id === id);
      if (notificationIndex !== -1) {
        notifications[notificationIndex] = {
          ...notifications[notificationIndex],
          read: true
        };
        resolve(notifications[notificationIndex]);
      } else {
        throw new Error('Notification not found');
      }
    }, 200);
  });
};

export const deleteReadNotifications = (): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialCount = notifications.length;
      notifications = notifications.filter(n => !n.read);
      const deletedCount = initialCount - notifications.length;
      resolve(deletedCount);
    }, 300);
  });
};

export const addNotification = (notification: Omit<Notification, 'id'>): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: String(notifications.length + 1)
  };
  notifications = [newNotification, ...notifications];
  return newNotification;
};

// Export notifications store for use in other services
export { notifications };
