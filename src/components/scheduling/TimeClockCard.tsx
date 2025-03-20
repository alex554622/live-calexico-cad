
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, LogIn, LogOut, Coffee, Utensils } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeBreak } from '@/types/scheduling';
import { useEmployeeShifts } from '@/hooks/scheduling/use-employee-shifts';
import { useData } from '@/context/data';

export const TimeClockCard = () => {
  const { user } = useAuth();
  const { officers } = useData();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBreakType, setSelectedBreakType] = useState<'paid10' | 'unpaid30' | 'unpaid60'>('paid10');
  
  const { 
    startShift,
    endShift,
    startBreak,
    endBreak,
    getCurrentUserShift,
    getCurrentUserBreak,
    activeShifts,
    activeBreaks 
  } = useEmployeeShifts();
  
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
  
  // Round time to nearest 15 minutes for display
  const roundTime = (date: Date) => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;
    const newDate = new Date(date);
    newDate.setMinutes(roundedMinutes, 0, 0);
    return newDate;
  };
  
  // Find matching officer for the current user
  const findOfficerIdForUser = () => {
    if (!user) return undefined;
    
    // In a real app, you would have a proper way to link users to officers
    // This is a simplified example using either matching names or emails
    const matchingOfficer = officers.find(officer => 
      (user.name && officer.name.includes(user.name)) ||
      (officer.contactInfo?.email && officer.contactInfo.email === user.username)
    );
    
    return matchingOfficer?.id;
  };
  
  const handleClockIn = async () => {
    const officerId = findOfficerIdForUser();
    await startShift(officerId);
  };
  
  const handleClockOut = async () => {
    if (!currentShift) return;
    await endShift(currentShift.id);
  };
  
  const handleBreakStart = async () => {
    if (!currentShift) return;
    await startBreak(currentShift.id, selectedBreakType);
  };
  
  const handleBreakEnd = async () => {
    if (!currentBreak) return;
    await endBreak(currentBreak.id);
  };
  
  // Get all events for the current user, sorted by time
  const getUserEvents = () => {
    if (!user) return [];
    
    const events = [];
    
    // Get all shifts for this user
    const userShifts = activeShifts.filter(shift => shift.employeeId === user.id);
    
    for (const shift of userShifts) {
      if (shift.clockIn) {
        events.push({
          id: `clock-in-${shift.id}`,
          type: 'in' as const,
          timestamp: shift.clockIn
        });
      }
      
      if (shift.clockOut) {
        events.push({
          id: `clock-out-${shift.id}`,
          type: 'out' as const,
          timestamp: shift.clockOut
        });
      }
      
      // Get all breaks for this shift
      const shiftBreaks = activeBreaks.filter(b => b.shiftId === shift.id);
      
      for (const breakItem of shiftBreaks) {
        events.push({
          id: `break-start-${breakItem.id}`,
          type: 'breakStart' as const,
          breakType: breakItem.type,
          timestamp: breakItem.startTime
        });
        
        if (breakItem.endTime) {
          events.push({
            id: `break-end-${breakItem.id}`,
            type: 'breakEnd' as const,
            breakType: breakItem.type,
            timestamp: breakItem.endTime
          });
        }
      }
    }
    
    // Sort events by timestamp, most recent first
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };
  
  // Recent clock events (last 5)
  const recentEvents = getUserEvents().slice(0, 5);
  
  const getEventIcon = (event: any) => {
    switch (event.type) {
      case 'in':
        return <LogIn className="mr-2 h-4 w-4 text-green-500" />;
      case 'out':
        return <LogOut className="mr-2 h-4 w-4 text-amber-500" />;
      case 'breakStart':
        return event.breakType === 'paid10' 
          ? <Coffee className="mr-2 h-4 w-4 text-blue-500" /> 
          : <Utensils className="mr-2 h-4 w-4 text-purple-500" />;
      case 'breakEnd':
        return event.breakType === 'paid10'
          ? <Coffee className="mr-2 h-4 w-4 text-gray-500" />
          : <Utensils className="mr-2 h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="mr-2 h-4 w-4" />;
    }
  };
  
  const getEventLabel = (event: any) => {
    switch (event.type) {
      case 'in':
        return 'Clock In';
      case 'out':
        return 'Clock Out';
      case 'breakStart':
        return event.breakType === 'paid10' 
          ? 'Start 10-min Break' 
          : event.breakType === 'unpaid30'
            ? 'Start 30-min Lunch'
            : 'Start 1-hour Lunch';
      case 'breakEnd':
        return event.breakType === 'paid10' 
          ? 'End 10-min Break' 
          : event.breakType === 'unpaid30'
            ? 'End 30-min Lunch'
            : 'End 1-hour Lunch';
      default:
        return 'Event';
    }
  };
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Employee Time Clock</CardTitle>
        <CardDescription>Record your working hours and breaks</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-muted/50">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-medium text-lg">{user?.name}</h3>
            <p className="text-muted-foreground text-sm">{user?.role}</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">{format(currentTime, 'h:mm:ss')}</div>
            <div className="text-xs text-muted-foreground">{format(currentTime, 'a')}</div>
            <div className="text-sm mt-1">{format(currentTime, 'MMM d, yyyy')}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {!isClockedIn ? (
            <>
              <Button 
                className="w-full"
                onClick={handleClockIn}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Clock In
              </Button>
              <div></div> {/* Empty space for grid alignment */}
            </>
          ) : isOnBreak ? (
            <>
              <Button 
                className="w-full"
                variant="outline"
                onClick={handleBreakEnd}
              >
                {currentBreak.type === 'paid10' ? (
                  <Coffee className="mr-2 h-4 w-4" />
                ) : (
                  <Utensils className="mr-2 h-4 w-4" />
                )}
                End Break
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleClockOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Clock Out
              </Button>
            </>
          ) : (
            <>
              <div className="col-span-2 grid grid-cols-3 gap-2">
                <Select
                  value={selectedBreakType}
                  onValueChange={(value) => 
                    setSelectedBreakType(value as 'paid10' | 'unpaid30' | 'unpaid60')
                  }
                >
                  <SelectTrigger className="col-span-1">
                    <SelectValue placeholder="Break Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid10">10-min (Paid)</SelectItem>
                    <SelectItem value="unpaid30">30-min Lunch</SelectItem>
                    <SelectItem value="unpaid60">1-hour Lunch</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  className="col-span-1"
                  onClick={handleBreakStart}
                >
                  {selectedBreakType === 'paid10' ? (
                    <Coffee className="mr-2 h-4 w-4" />
                  ) : (
                    <Utensils className="mr-2 h-4 w-4" />
                  )}
                  Break
                </Button>
                <Button 
                  className="col-span-1" 
                  variant="outline"
                  onClick={handleClockOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Out
                </Button>
              </div>
            </>
          )}
        </div>
        
        {recentEvents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between text-sm p-2 border rounded">
                  <div className="flex items-center">
                    {getEventIcon(event)}
                    <span>{getEventLabel(event)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {format(event.timestamp, 'h:mm a')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        <Clock className="mr-1 h-3 w-3" />
        Your time records are automatically saved and processed weekly
      </CardFooter>
    </Card>
  );
};
