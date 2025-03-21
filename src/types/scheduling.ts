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

// Updated interface for database-backed shifts to match database structure
export interface EmployeeShift {
  id: string;
  employeeId: string;
  officerId?: string;
  clockIn: Date | null;
  clockOut: Date | null;
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  employee?: Employee;
  breaks?: EmployeeBreak[];
  // Add these properties to handle Supabase response structure
  employee_breaks?: any[];
  employee_id?: string;
  officer_id?: string;
  clock_in?: string;
  clock_out?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeBreak {
  id: string;
  shiftId: string;
  type: 'paid10' | 'unpaid30' | 'unpaid60';
  startTime: Date;
  endTime: Date | null;
  duration: number | null; // Duration in minutes
  createdAt: Date;
  // Add these properties to handle Supabase response structure
  shift_id?: string;
  start_time?: string;
  end_time?: string;
  created_at?: string;
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
  currentShift?: EmployeeShift;
  currentBreak?: EmployeeBreak;
}
