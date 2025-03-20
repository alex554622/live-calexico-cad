
import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useEmployeeShifts } from '@/hooks/scheduling/use-employee-shifts';
import { EmployeeShift } from '@/types/scheduling';

interface ClockInOutActionsProps {
  isClockingIn: boolean;
  setIsClockingIn: React.Dispatch<React.SetStateAction<boolean>>;
  isClockingOut: boolean;
  setIsClockingOut: React.Dispatch<React.SetStateAction<boolean>>;
  currentShift: EmployeeShift | null;
  findOfficerIdForUser: () => string | undefined;
}

export const ClockInOutActions: React.FC<ClockInOutActionsProps> = ({
  isClockingIn,
  setIsClockingIn,
  isClockingOut,
  setIsClockingOut,
  currentShift,
  findOfficerIdForUser
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startShift, endShift } = useEmployeeShifts();

  const handleClockIn = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to clock in',
        variant: 'destructive',
      });
      return;
    }
    
    // Ensure that the user has a valid UUID
    if (!user.id || typeof user.id !== 'string' || user.id === 'admin-id') {
      toast({
        title: 'Error',
        description: 'You have an invalid user ID. Please contact support.',
        variant: 'destructive',
      });
      console.error('Invalid user ID for clock in:', user.id);
      return;
    }
    
    setIsClockingIn(true);
    try {
      const officerId = findOfficerIdForUser();
      console.log('Clocking in with user ID:', user.id, 'officer ID:', officerId);
      await startShift(officerId);
      toast({
        title: 'Success',
        description: 'You have successfully clocked in',
      });
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start shift. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsClockingIn(false);
    }
  };
  
  const handleClockOut = async () => {
    if (!currentShift) return;
    
    setIsClockingOut(true);
    try {
      await endShift(currentShift.id);
      toast({
        title: 'Success',
        description: 'You have successfully clocked out',
      });
    } catch (error) {
      console.error('Error clocking out:', error);
      toast({
        title: 'Error',
        description: 'Failed to end shift. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsClockingOut(false);
    }
  };

  if (!currentShift) {
    return (
      <>
        <Button 
          className="w-full"
          onClick={handleClockIn}
          disabled={isClockingIn}
        >
          <LogIn className="mr-2 h-4 w-4" />
          {isClockingIn ? 'Clocking In...' : 'Clock In'}
        </Button>
        <div></div> {/* Empty space for grid alignment */}
      </>
    );
  }

  return (
    <Button 
      className="w-full" 
      variant="outline"
      onClick={handleClockOut}
      disabled={isClockingOut}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isClockingOut ? 'Processing...' : 'Clock Out'}
    </Button>
  );
};
