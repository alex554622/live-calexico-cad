
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeShift, EmployeeBreak, Employee } from '@/types/scheduling';
import { useShiftsService } from './use-shifts-service';

/**
 * Hook for fetching and subscribing to shifts data
 */
export const useShiftsData = () => {
  const [activeShifts, setActiveShifts] = useState<EmployeeShift[]>([]);
  const [activeBreaks, setActiveBreaks] = useState<EmployeeBreak[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { transformShiftData } = useShiftsService();

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
      
      const transformedShifts = transformShiftData(shiftsData || []);
      
      // Get active breaks (where end_time is null)
      const activeBreaksData: EmployeeBreak[] = [];
      for (const shift of transformedShifts) {
        const activeShiftBreaks = shift.breaks?.filter(b => b.endTime === null) || [];
        activeBreaksData.push(...activeShiftBreaks);
      }
      
      setActiveShifts(transformedShifts);
      setActiveBreaks(activeBreaksData);
      
      // Create employee data from shifts
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
      throw error;
    } finally {
      setLoading(false);
    }
  }, [transformShiftData]);

  // Set up realtime subscriptions
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

  return {
    activeShifts,
    activeBreaks,
    employees,
    loading,
    refreshData: fetchActiveShifts
  };
};
