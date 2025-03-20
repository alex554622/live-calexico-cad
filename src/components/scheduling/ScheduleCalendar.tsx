
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSchedules } from '@/hooks/scheduling/use-schedules';
import { employees } from './schedule-data';
import { Skeleton } from '@/components/ui/skeleton';

export const ScheduleCalendar = () => {
  const { schedules, loading } = useSchedules();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  // Get schedules for the selected date
  const selectedDateSchedules = React.useMemo(() => {
    if (!date) return [];
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    return schedules.filter(schedule => 
      schedule.date === formattedDate
    );
  }, [schedules, date]);

  // Find employee name by ID
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  // Render loading skeletons
  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="w-full">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border mx-auto"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {date ? format(date, 'MMMM d, yyyy') : 'No Date Selected'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            renderLoadingState()
          ) : selectedDateSchedules.length > 0 ? (
            <div className="space-y-4">
              {selectedDateSchedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{getEmployeeName(schedule.employee_id)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {schedule.start_time} - {schedule.end_time}
                      </p>
                    </div>
                    <Badge>{schedule.position}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No schedules for this date</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
