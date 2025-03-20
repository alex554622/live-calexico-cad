
import { useCallback } from 'react';
import { EmployeeShift, EmployeeBreak } from '@/types/scheduling';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useShiftsService } from './use-shifts-service';
import { useBreaksService } from './use-breaks-service';
import { useShiftsData } from './use-shifts-data';

/**
 * Main hook that combines shift data, shift operations, and break operations
 */
export const useEmployeeShifts = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeShifts, activeBreaks, employees, loading, refreshData } = useShiftsData();
  const { startShift: startShiftService, endShift: endShiftService } = useShiftsService();
  const { startBreak: startBreakService, endBreak: endBreakService } = useBreaksService();

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
      const result = await startShiftService(user.id, officerId);
      
      toast({
        title: 'Success',
        description: result.message,
      });

      await refreshData();
      return result.data;
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
      // First, end any active breaks
      const activeBreak = activeBreaks.find(b => b.shiftId === shiftId);
      if (activeBreak) {
        await endBreak(activeBreak.id);
      }
      
      // Then end the shift
      const result = await endShiftService(shiftId);

      toast({
        title: 'Success',
        description: result.message,
      });

      await refreshData();
      return result.data;
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
      const result = await startBreakService(shiftId, breakType);
      
      toast({
        title: 'Break Started',
        description: result.message,
      });

      await refreshData();
      return result.data;
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
      const result = await endBreakService(breakId);

      toast({
        title: 'Break Ended',
        description: result.message,
      });

      await refreshData();
      return result.data;
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
    refreshData
  };
};
