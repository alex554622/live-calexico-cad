
import { supabase } from '@/integrations/supabase/client';
import { EmployeeShift } from '@/types/scheduling';
import { format } from 'date-fns';

/**
 * Service for shift-related database operations
 */
export const useShiftsService = () => {
  /**
   * Start a new shift for the specified user
   */
  const startShift = async (userId: string, officerId?: string) => {
    try {
      const now = new Date();
      
      const { data, error } = await supabase
        .from('employee_shifts')
        .insert({
          employee_id: userId,
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

      return { 
        data,
        timestamp: now,
        message: `Successfully clocked in at ${format(now, 'h:mm a')}`
      };
    } catch (error) {
      console.error('Error starting shift:', error);
      throw error;
    }
  };

  /**
   * End an active shift
   */
  const endShift = async (shiftId: string) => {
    try {
      const now = new Date();
      
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

      return { 
        data, 
        timestamp: now,
        message: `Successfully clocked out at ${format(now, 'h:mm a')}`
      };
    } catch (error) {
      console.error('Error ending shift:', error);
      throw error;
    }
  };

  /**
   * Transform raw shift data from database to properly typed objects
   */
  const transformShiftData = (shiftsData: any[]): EmployeeShift[] => {
    return shiftsData.map(shift => {
      const breakItems = shift.employee_breaks || [];
      
      return {
        ...shift,
        id: shift.id,
        employeeId: shift.employee_id,
        officerId: shift.officer_id,
        clockIn: shift.clock_in ? new Date(shift.clock_in) : null,
        clockOut: shift.clock_out ? new Date(shift.clock_out) : null,
        status: shift.status,
        createdAt: new Date(shift.created_at),
        updatedAt: new Date(shift.updated_at),
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
  };

  return {
    startShift,
    endShift,
    transformShiftData
  };
};
