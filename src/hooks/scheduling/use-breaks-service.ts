
import { supabase } from '@/integrations/supabase/client';
import { EmployeeBreak } from '@/types/scheduling';
import { format } from 'date-fns';

/**
 * Service for break-related database operations
 */
export const useBreaksService = () => {
  /**
   * Start a break for a specific shift
   */
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
      
      return {
        data,
        timestamp: now,
        message: `Started ${breakTypeLabel} at ${format(now, 'h:mm a')}`
      };
    } catch (error) {
      console.error('Error starting break:', error);
      throw error;
    }
  };

  /**
   * End an active break
   */
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

      return {
        data,
        timestamp: now,
        message: `Ended break at ${format(now, 'h:mm a')}`
      };
    } catch (error) {
      console.error('Error ending break:', error);
      throw error;
    }
  };

  /**
   * Extract active breaks from shift data
   */
  const getActiveBreaksFromShifts = (shifts: any[]): EmployeeBreak[] => {
    const activeBreaksData: EmployeeBreak[] = [];
    
    for (const shift of shifts) {
      const shiftBreaks = shift.breaks || [];
      const activeShiftBreaks = shiftBreaks.filter((b: any) => b.endTime === null);
      activeBreaksData.push(...activeShiftBreaks);
    }
    
    return activeBreaksData;
  };

  return {
    startBreak,
    endBreak,
    getActiveBreaksFromShifts
  };
};
