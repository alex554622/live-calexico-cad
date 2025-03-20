
// Types for the scheduling functionality

export interface TimeSheetEntry {
  day: string;
  hoursWorked: number;
  clockIn: string;
  clockOut: string;
}

export interface TimeSheet {
  id: string;
  employeeId: string;
  employeeName: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  status: 'approved' | 'pending' | 'rejected';
  entries: TimeSheetEntry[];
}

export interface ScheduleEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  startTime: string;
  endTime: string;
  position: string;
}

export interface ClockEvent {
  id: string;
  employeeId: string;
  type: 'in' | 'out';
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
  note?: string;
}
