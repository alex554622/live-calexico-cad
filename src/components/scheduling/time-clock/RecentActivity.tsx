
import React from 'react';
import { format } from 'date-fns';
import { Clock, LogIn, LogOut, Coffee, Utensils } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEmployeeShifts } from '@/hooks/scheduling/use-employee-shifts';

export const RecentActivity: React.FC = () => {
  const { user } = useAuth();
  const { activeShifts, activeBreaks } = useEmployeeShifts();

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

  if (recentEvents.length === 0) {
    return null;
  }

  return (
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
  );
};
