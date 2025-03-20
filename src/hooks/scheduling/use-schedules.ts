
import { useState, useEffect, useCallback } from 'react';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '@/services/scheduleService';
import { useToast } from '@/hooks/use-toast';
import { ScheduleFormSchema } from '@/components/scheduling/types';

export interface Schedule {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  created_at: string;
}

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSchedules();
      setSchedules(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch schedules'));
      toast({
        title: 'Error',
        description: 'Failed to load schedules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Add a new schedule
  const addSchedule = async (scheduleData: ScheduleFormSchema) => {
    try {
      await createSchedule(scheduleData);
      toast({
        title: 'Success',
        description: 'Schedule created successfully',
      });
      await fetchSchedules(); // Refresh the list
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create schedule',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Update an existing schedule
  const editSchedule = async (id: string, scheduleData: Partial<ScheduleFormSchema>) => {
    try {
      await updateSchedule(id, scheduleData);
      toast({
        title: 'Success',
        description: 'Schedule updated successfully',
      });
      await fetchSchedules(); // Refresh the list
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update schedule',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete a schedule
  const removeSchedule = async (id: string) => {
    try {
      await deleteSchedule(id);
      toast({
        title: 'Success',
        description: 'Schedule deleted successfully',
      });
      await fetchSchedules(); // Refresh the list
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return { 
    schedules, 
    loading, 
    error, 
    refreshSchedules: fetchSchedules,
    addSchedule,
    editSchedule,
    removeSchedule
  };
}
