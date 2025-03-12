
import { useState, useCallback, useEffect } from 'react';
import { Officer, Incident, Notification } from '@/types';
import { useAuth } from '@/context/auth';
import { useOfficers } from './hooks/useOfficers';
import { useIncidents } from './hooks/useIncidents';
import { useNotifications } from './hooks/useNotifications';
import { useRealTimeUpdates } from './hooks/useRealTimeUpdates';

export const useDataProvider = () => {
  // Initialize state for data sharing between hooks
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Get hook functionality
  const officersHook = useOfficers();
  const incidentsHook = useIncidents(setOfficers);
  const notificationsHook = useNotifications();

  // Set up real-time updates
  useRealTimeUpdates(user, setOfficers, setIncidents, setNotifications);

  // Sync local state with hook state
  useEffect(() => {
    setOfficers(officersHook.officers);
  }, [officersHook.officers]);

  useEffect(() => {
    setIncidents(incidentsHook.incidents);
  }, [incidentsHook.incidents]);

  useEffect(() => {
    setNotifications(notificationsHook.notifications);
  }, [notificationsHook.notifications]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      officersHook.fetchOfficers(),
      incidentsHook.fetchIncidents(),
      notificationsHook.fetchNotifications()
    ]);
  }, [officersHook.fetchOfficers, incidentsHook.fetchIncidents, notificationsHook.fetchNotifications]);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  // Combine all functionality
  return {
    officers,
    incidents,
    notifications,
    loadingOfficers: officersHook.loadingOfficers,
    loadingIncidents: incidentsHook.loadingIncidents,
    loadingNotifications: notificationsHook.loadingNotifications,
    refreshData,
    // Officers actions
    updateOfficerStatus: officersHook.updateOfficerStatus,
    createOfficer: officersHook.createOfficer,
    updateOfficer: officersHook.updateOfficer,
    deleteOfficer: officersHook.deleteOfficer,
    // Incidents actions
    updateIncident: incidentsHook.updateIncident,
    createIncident: incidentsHook.createIncident,
    assignOfficerToIncident: incidentsHook.assignOfficerToIncident,
    deleteIncident: (incidentId: string) => incidentsHook.deleteIncident(incidentId, officers),
    // Notifications actions
    markNotificationAsRead: notificationsHook.markNotificationAsRead,
    deleteReadNotifications: notificationsHook.deleteReadNotifications,
  };
};
