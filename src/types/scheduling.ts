
// Types for the scheduling functionality

export interface TimeSheetEntry {
  day: string;
  hoursWorked: number;
  clockIn: string;
  clockOut: string;
  breaks: BreakEntry[];
}

export interface BreakEntry {
  type: 'paid10' | 'unpaid30' | 'unpaid60';
  startTime: string;
  endTime: string;
  duration: number; // Duration in minutes
}

export interface TimeSheet {
  id: string;
  employeeId: string;
  employeeName: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
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
  breaks?: {
    paid10Min?: number; // Number of 10-minute paid breaks
    unpaid30Min?: boolean; // 30-minute unpaid lunch
    unpaid60Min?: boolean; // 1-hour unpaid lunch
  };
}

export interface ClockEvent {
  id: string;
  employeeId: string;
  type: 'in' | 'out' | 'breakStart' | 'breakEnd';
  breakType?: 'paid10' | 'unpaid30' | 'unpaid60';
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
  note?: string;
}

// Employee type to connect with officers
export interface Employee {
  id: string;
  officerId?: string; // Optional link to officer ID
  name: string;
  position: string;
  department: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'onLeave';
  contactInfo: {
    email: string;
    phone: string;
  };
}
