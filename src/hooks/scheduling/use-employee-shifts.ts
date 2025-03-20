
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeShift, EmployeeBreak, Employee } from '@/types/scheduling';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

export const useEmployeeShifts = () => {
  const [activeShifts, setActiveShifts] = useState<EmployeeShift[]>([]);
  const [activeBreaks, setActiveBreaks] = useState<EmployeeBreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch active shifts and their breaks
  const fetchActiveShifts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all active shifts
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('employee_shifts')
        .select('*, employee_breaks(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (shiftsError) throw shiftsError;
      
      const shifts = shiftsData as unknown as EmployeeShift[];
      
      // Transform the data to properly type the nested breaks
      const transformedShifts = shifts.map(shift => {
        // Get the breaks from the employee_breaks property
        const breakItems = shift.employee_breaks || [];
        
        return {
          ...shift,
          clockIn: shift.clockIn ? new Date(shift.clockIn) : null,
          clockOut: shift.clockOut ? new Date(shift.clockOut) : null,
          createdAt: new Date(shift.createdAt),
          updatedAt: new Date(shift.updatedAt),
          // Add the breaks to the breaks property
          breaks: breakItems.map((breakItem: any) => ({
            id: breakItem.id,
            shiftId: breakItem.shift_id,
            type: breakItem.type as 'paid10' | 'unpaid30' | 'unpaid60',
            startTime: new Date(breakItem.start_time),
            endTime: breakItem.end_time ? new Date(breakItem.end_time) : null,
            duration: breakItem.duration,
            createdAt: new Date(breakItem.created_at)
          }))
        };
      });
      
      // Get active breaks (where end_time is null)
      const activeBreaksData = [];
      for (const shift of transformedShifts) {
        const activeShiftBreaks = shift.breaks?.filter(b => b.endTime === null) || [];
        activeBreaksData.push(...activeShiftBreaks);
      }
      
      setActiveShifts(transformedShifts);
      setActiveBreaks(activeBreaksData);
      
      // Fetch employee data (in a real app, you'd join with users/officers tables)
      // For now, we'll create dummy data based on the employee_id
      const employeeMap = new Map();
      transformedShifts.forEach(shift => {
        if (!employeeMap.has(shift.employeeId)) {
          employeeMap.set(shift.employeeId, {
            id: shift.employeeId,
            officerId: shift.officerId || undefined,
            name: `Employee ${shift.employeeId.substring(0, 5)}`,
            position: 'Security Officer',
            department: 'Operations',
            hireDate: '2023-01-01',
            status: 'active',
            contactInfo: {
              email: `employee${shift.employeeId.substring(0, 3)}@example.com`,
              phone: '555-123-4567'
            },
            currentShift: shift,
            currentBreak: activeBreaksData.find(b => b.shiftId === shift.id)
          });
        }
      });
      
      setEmployees(Array.from(employeeMap.values()));
    } catch (error) {
      console.error('Error fetching active shifts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load active shifts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Start a new shift for the current user
  const startShift = async (officerId?: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to start a shift',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const now = new Date();
      
      // Fix: Use snake_case for column names to match the database schema
      const { data, error } = await supabase
        .from('employee_shifts')
        .insert({
          employee_id: user.id,
          officer_id: officerId || null,
          clock_in: now.toISOString(),
          status: 'active',
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Database error when starting shift:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: `Successfully clocked in at ${format(now, 'h:mm a')}`,
      });

      await fetchActiveShifts();
      return data;
    } catch (error) {
      console.error('Error starting shift:', error);
      toast({
        title: 'Error',
        description: 'Failed to start shift. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // End the current active shift
  const endShift = async (shiftId: string) => {
    try {
      const now = new Date();
      
      // First, end any active breaks
      const activeBreak = activeBreaks.find(b => b.shiftId === shiftId);
      if (activeBreak) {
        await endBreak(activeBreak.id);
      }
      
      // Then end the shift
      const { data, error } = await supabase
        .from('employee_shifts')
        .update({
          clock_out: now.toISOString(),
          status: 'completed',
          updated_at: now.toISOString()
        })
        .eq('id', shiftId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Successfully clocked out at ${format(now, 'h:mm a')}`,
      });

      await fetchActiveShifts();
      return data;
    } catch (error) {
      console.error('Error ending shift:', error);
      toast({
        title: 'Error',
        description: 'Failed to end shift',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Start a break
  const startBreak = async (shiftId: string, breakType: 'paid10' | 'unpaid30' | 'unpaid60') => {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('employee_breaks')
        .insert({
          shift_id: shiftId,
          type: breakType,
          start_time: now.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const breakTypeLabel = 
        breakType === 'paid10' ? '10-minute paid break' : 
        breakType === 'unpaid30' ? '30-minute lunch break' : 
        '1-hour lunch break';
      
      toast({
        title: 'Break Started',
        description: `Started ${breakTypeLabel} at ${format(now, 'h:mm a')}`,
      });

      await fetchActiveShifts();
      return data;
    } catch (error) {
      console.error('Error starting break:', error);
      toast({
        title: 'Error',
        description: 'Failed to start break',
        variant: 'destructive',
      });
      return null;
    }
  };

  // End a break
  const endBreak = async (breakId: string) => {
    try {
      const now = new Date();
      const { data: breakData, error: fetchError } = await supabase
        .from('employee_breaks')
        .select('start_time, type')
        .eq('id', breakId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const startTime = new Date(breakData.start_time);
      const durationMinutes = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60));
      
      const { data, error } = await supabase
        .from('employee_breaks')
        .update({
          end_time: now.toISOString(),
          duration: durationMinutes
        })
        .eq('id', breakId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Break Ended',
        description: `Ended break at ${format(now, 'h:mm a')}`,
      });

      await fetchActiveShifts();
      return data;
    } catch (error) {
      console.error('Error ending break:', error);
      toast({
        title: 'Error',
        description: 'Failed to end break',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchActiveShifts();
    
    // Set up realtime subscription for shifts and breaks
    const shiftsChannel = supabase
      .channel('shifts-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'employee_shifts'
      }, () => {
        fetchActiveShifts();
      })
      .subscribe();
      
    const breaksChannel = supabase
      .channel('breaks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'employee_breaks'
      }, () => {
        fetchActiveShifts();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(shiftsChannel);
      supabase.removeChannel(breaksChannel);
    };
  }, [fetchActiveShifts]);

  // Check if the current user is on shift
  const getCurrentUserShift = useCallback(() => {
    if (!user) return null;
    return activeShifts.find(shift => shift.employeeId === user.id);
  }, [user, activeShifts]);

  // Check if the current user is on break
  const getCurrentUserBreak = useCallback(() => {
    const currentShift = getCurrentUserShift();
    if (!currentShift) return null;
    
    return activeBreaks.find(breakItem => breakItem.shiftId === currentShift.id);
  }, [getCurrentUserShift, activeBreaks]);

  return {
    activeShifts,
    activeBreaks,
    employees,
    loading,
    startShift,
    endShift,
    startBreak,
    endBreak,
    getCurrentUserShift,
    getCurrentUserBreak,
    refreshData: fetchActiveShifts
  };
};
