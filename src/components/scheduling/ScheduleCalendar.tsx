
import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ScheduleEvent = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  startTime: string;
  endTime: string;
  position: string;
};

// Sample data
const sampleSchedules: ScheduleEvent[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    date: new Date(2023, 9, 10),
    startTime: '09:00',
    endTime: '17:00',
    position: 'Dispatcher'
  },
  {
    id: '2',
    employeeId: 'emp2',
    employeeName: 'Jane Smith',
    date: new Date(2023, 9, 10),
    startTime: '10:00',
    endTime: '18:00',
    position: 'Officer'
  },
  {
    id: '3',
    employeeId: 'emp3',
    employeeName: 'Mike Johnson',
    date: new Date(2023, 9, 11),
    startTime: '08:00',
    endTime: '16:00',
    position: 'Supervisor'
  }
];

export const ScheduleCalendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [schedules] = useState<ScheduleEvent[]>(sampleSchedules);
  
  // Function to display schedules for the selected date
  const getDaySchedules = (day: Date) => {
    return schedules.filter(schedule => isSameDay(schedule.date, day));
  };
  
  const selectedDaySchedules = getDaySchedules(date);
  
  // Function to calculate how many employees are scheduled for a given date
  const getEmployeeCountForDate = (date: Date) => {
    return getDaySchedules(date).length;
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="rounded-md border"
            modifiers={{
              hasSchedule: (date) => getEmployeeCountForDate(date) > 0,
            }}
            modifiersStyles={{
              hasSchedule: { fontWeight: 'bold', textDecoration: 'underline' },
            }}
            components={{
              DayContent: ({ date: dayDate }) => {
                const count = getEmployeeCountForDate(dayDate);
                return (
                  <div className="flex flex-col items-center">
                    {dayDate.getDate()}
                    {count > 0 && (
                      <Badge variant="secondary" className="mt-1 text-[10px] h-4 px-1">
                        {count}
                      </Badge>
                    )}
                  </div>
                );
              },
            }}
          />
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Schedule for {format(date, 'MMMM d, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDaySchedules.length > 0 ? (
            <div className="space-y-4">
              {selectedDaySchedules.map((schedule) => (
                <div 
                  key={schedule.id} 
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <h4 className="font-medium">{schedule.employeeName}</h4>
                    <p className="text-sm text-muted-foreground">{schedule.position}</p>
                  </div>
                  <div className="text-sm">
                    {schedule.startTime} - {schedule.endTime}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No schedules for this day. Use the "Add Schedule" button to create one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
