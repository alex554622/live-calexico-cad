
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useEmployeeShifts } from '@/hooks/scheduling/use-employee-shifts';
import { UserProfile } from './time-clock/UserProfile';
import { ClockInOutActions } from './time-clock/ClockInOutActions';
import { BreakActions } from './time-clock/BreakActions';
import { RecentActivity } from './time-clock/RecentActivity';
import { useTimeClockUtils } from './time-clock/TimeClockUtils';

export const TimeClockCard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBreakType, setSelectedBreakType] = useState<'paid10' | 'unpaid30' | 'unpaid60'>('paid10');
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [isProcessingBreak, setIsProcessingBreak] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);
  
  const { getCurrentUserShift, getCurrentUserBreak } = useEmployeeShifts();
  const { findOfficerIdForUser } = useTimeClockUtils();
  
  const currentShift = getCurrentUserShift();
  const currentBreak = getCurrentUserBreak();
  
  // State derived from the hooks
  const isClockedIn = !!currentShift;
  const isOnBreak = !!currentBreak;
  
  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Employee Time Clock</CardTitle>
        <CardDescription>Record your working hours and breaks</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <UserProfile currentTime={currentTime} />
        
        <div className="grid grid-cols-2 gap-4">
          {!isClockedIn ? (
            <ClockInOutActions 
              isClockingIn={isClockingIn}
              setIsClockingIn={setIsClockingIn}
              isClockingOut={isClockingOut}
              setIsClockingOut={setIsClockingOut}
              currentShift={currentShift}
              findOfficerIdForUser={findOfficerIdForUser}
            />
          ) : isOnBreak ? (
            <>
              <BreakActions 
                currentShift={currentShift}
                currentBreak={currentBreak}
                selectedBreakType={selectedBreakType}
                setSelectedBreakType={setSelectedBreakType}
                isProcessingBreak={isProcessingBreak}
                setIsProcessingBreak={setIsProcessingBreak}
              />
              <ClockInOutActions 
                isClockingIn={isClockingIn}
                setIsClockingIn={setIsClockingIn}
                isClockingOut={isClockingOut}
                setIsClockingOut={setIsClockingOut}
                currentShift={currentShift}
                findOfficerIdForUser={findOfficerIdForUser}
              />
            </>
          ) : (
            <BreakActions 
              currentShift={currentShift}
              currentBreak={currentBreak}
              selectedBreakType={selectedBreakType}
              setSelectedBreakType={setSelectedBreakType}
              isProcessingBreak={isProcessingBreak}
              setIsProcessingBreak={setIsProcessingBreak}
            />
          )}
        </div>
        
        <RecentActivity />
      </CardContent>
      
      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        <Clock className="mr-1 h-3 w-3" />
        Your time records are automatically saved and processed weekly
      </CardFooter>
    </Card>
  );
};
