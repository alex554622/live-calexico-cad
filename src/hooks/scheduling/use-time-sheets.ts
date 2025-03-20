
import { useState, useEffect } from 'react';
import { TimeSheet, BreakEntry } from '@/types/scheduling';
import { toast } from '@/hooks/use-toast';
import { useData } from '@/context/data';

// Sample data with enhanced details
const sampleTimeSheets: TimeSheet[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    weekLabel: 'Week of Oct 2, 2023',
    startDate: '2023-10-02',
    endDate: '2023-10-08',
    totalHours: 40.5,
    regularHours: 40.0,
    overtimeHours: 0.5,
    status: 'approved',
    entries: [
      { 
        day: 'Monday', 
        hoursWorked: 8.5, 
        clockIn: '08:45', 
        clockOut: '17:15',
        breaks: [
          { type: 'paid10', startTime: '10:30', endTime: '10:40', duration: 10 },
          { type: 'unpaid30', startTime: '12:00', endTime: '12:30', duration: 30 }
        ]
      },
      { 
        day: 'Tuesday', 
        hoursWorked: 8, 
        clockIn: '09:00', 
        clockOut: '17:30',
        breaks: [
          { type: 'paid10', startTime: '10:30', endTime: '10:40', duration: 10 },
          { type: 'unpaid30', startTime: '12:15', endTime: '12:45', duration: 30 }
        ]
      },
      { 
        day: 'Wednesday', 
        hoursWorked: 8, 
        clockIn: '09:00', 
        clockOut: '17:30',
        breaks: [
          { type: 'paid10', startTime: '10:45', endTime: '10:55', duration: 10 },
          { type: 'unpaid30', startTime: '12:00', endTime: '12:30', duration: 30 }
        ]
      },
      { 
        day: 'Thursday', 
        hoursWorked: 8, 
        clockIn: '09:00', 
        clockOut: '17:30',
        breaks: [
          { type: 'paid10', startTime: '10:30', endTime: '10:40', duration: 10 },
          { type: 'unpaid30', startTime: '12:00', endTime: '12:30', duration: 30 }
        ]
      },
      { 
        day: 'Friday', 
        hoursWorked: 8, 
        clockIn: '09:00', 
        clockOut: '17:30',
        breaks: [
          { type: 'paid10', startTime: '10:30', endTime: '10:40', duration: 10 },
          { type: 'unpaid30', startTime: '12:00', endTime: '12:30', duration: 30 }
        ]
      },
    ]
  },
  {
    id: '2',
    employeeId: 'emp2',
    employeeName: 'Jane Smith',
    weekLabel: 'Week of Oct 9, 2023',
    startDate: '2023-10-09',
    endDate: '2023-10-15',
    totalHours: 32.5,
    regularHours: 32.5,
    overtimeHours: 0,
    status: 'pending',
    entries: [
      { 
        day: 'Monday', 
        hoursWorked: 7.5, 
        clockIn: '09:30', 
        clockOut: '17:30',
        breaks: [
          { type: 'paid10', startTime: '11:00', endTime: '11:10', duration: 10 },
          { type: 'unpaid30', startTime: '13:00', endTime: '13:30', duration: 30 }
        ]
      },
      { 
        day: 'Tuesday', 
        hoursWorked: 8, 
        clockIn: '09:00', 
        clockOut: '17:30',
        breaks: [
          { type: 'paid10', startTime: '11:00', endTime: '11:10', duration: 10 },
          { type: 'unpaid30', startTime: '12:30', endTime: '13:00', duration: 30 }
        ]
      },
      { 
        day: 'Wednesday', 
        hoursWorked: 9, 
        clockIn: '08:00', 
        clockOut: '17:30',
        breaks: [
          { type: 'paid10', startTime: '10:00', endTime: '10:10', duration: 10 },
          { type: 'unpaid30', startTime: '12:30', endTime: '13:00', duration: 30 }
        ]
      },
      { 
        day: 'Thursday', 
        hoursWorked: 8, 
        clockIn: '09:00', 
        clockOut: '17:30',
        breaks: [
          { type: 'paid10', startTime: '11:00', endTime: '11:10', duration: 10 },
          { type: 'unpaid30', startTime: '12:30', endTime: '13:00', duration: 30 }
        ]
      },
      { 
        day: 'Friday', 
        hoursWorked: 0, 
        clockIn: '', 
        clockOut: '',
        breaks: []
      },
    ]
  },
  {
    id: '3',
    employeeId: 'emp3',
    employeeName: 'Mike Johnson',
    weekLabel: 'Week of Oct 16, 2023',
    startDate: '2023-10-16',
    endDate: '2023-10-22',
    totalHours: 44.0,
    regularHours: 40.0,
    overtimeHours: 4.0,
    status: 'approved',
    entries: [
      { 
        day: 'Monday', 
        hoursWorked: 8, 
        clockIn: '09:00', 
        clockOut: '17:30',
        breaks: [
          { type: 'paid10', startTime: '10:30', endTime: '10:40', duration: 10 },
          { type: 'unpaid30', startTime: '12:00', endTime: '12:30', duration: 30 }
        ]
      },
      { 
        day: 'Tuesday', 
        hoursWorked: 10, 
        clockIn: '08:00', 
        clockOut: '18:30',
        breaks: [
          { type: 'paid10', startTime: '10:00', endTime: '10:10', duration: 10 },
          { type: 'unpaid30', startTime: '12:30', endTime: '13:00', duration: 30 }
        ]
      },
      { 
        day: 'Wednesday', 
        hoursWorked: 8, 
        clockIn: '09:00', 
        clockOut: '17:30',
        breaks: [
          { type: 'paid10', startTime: '10:30', endTime: '10:40', duration: 10 },
          { type: 'unpaid30', startTime: '12:00', endTime: '12:30', duration: 30 }
        ]
      },
      { 
        day: 'Thursday', 
        hoursWorked: 10, 
        clockIn: '08:00', 
        clockOut: '18:30',
        breaks: [
          { type: 'paid10', startTime: '10:00', endTime: '10:10', duration: 10 },
          { type: 'unpaid60', startTime: '12:00', endTime: '13:00', duration: 60 }
        ]
      },
      { 
        day: 'Friday', 
        hoursWorked: 8, 
        clockIn: '09:00', 
        clockOut: '17:30',
        breaks: [
          { type: 'paid10', startTime: '10:30', endTime: '10:40', duration: 10 },
          { type: 'unpaid30', startTime: '12:00', endTime: '12:30', duration: 30 }
        ]
      },
    ]
  },
  {
    id: '4',
    employeeId: 'emp4',
    employeeName: 'Sarah Williams',
    weekLabel: 'Week of Oct 23, 2023',
    startDate: '2023-10-23',
    endDate: '2023-10-29',
    totalHours: 20.0,
    regularHours: 20.0,
    overtimeHours: 0.0,
    status: 'rejected',
    entries: [
      { 
        day: 'Monday', 
        hoursWorked: 4, 
        clockIn: '09:00', 
        clockOut: '13:30',
        breaks: [
          { type: 'paid10', startTime: '11:00', endTime: '11:10', duration: 10 },
        ]
      },
      { 
        day: 'Tuesday', 
        hoursWorked: 4, 
        clockIn: '09:00', 
        clockOut: '13:30',
        breaks: [
          { type: 'paid10', startTime: '11:00', endTime: '11:10', duration: 10 },
        ]
      },
      { 
        day: 'Wednesday', 
        hoursWorked: 4, 
        clockIn: '09:00', 
        clockOut: '13:30',
        breaks: [
          { type: 'paid10', startTime: '11:00', endTime: '11:10', duration: 10 },
        ]
      },
      { 
        day: 'Thursday', 
        hoursWorked: 4, 
        clockIn: '09:00', 
        clockOut: '13:30',
        breaks: [
          { type: 'paid10', startTime: '11:00', endTime: '11:10', duration: 10 },
        ]
      },
      { 
        day: 'Friday', 
        hoursWorked: 4, 
        clockIn: '09:00', 
        clockOut: '13:30',
        breaks: [
          { type: 'paid10', startTime: '11:00', endTime: '11:10', duration: 10 },
        ]
      },
    ]
  }
];

// Helper function to calculate actual worked hours excluding unpaid breaks
const calculateActualHours = (timeSheet: TimeSheet): TimeSheet => {
  const updatedEntries = timeSheet.entries.map(entry => {
    let actualHours = entry.hoursWorked;
    
    // Subtract unpaid break times
    entry.breaks.forEach(breakItem => {
      if (breakItem.type === 'unpaid30' || breakItem.type === 'unpaid60') {
        actualHours -= breakItem.duration / 60;
      }
    });
    
    return {
      ...entry,
      hoursWorked: Math.round(actualHours * 10) / 10 // Round to 1 decimal place
    };
  });
  
  // Calculate total hours
  const totalHours = updatedEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
  
  // Calculate regular and overtime hours
  const regularHours = Math.min(40, totalHours);
  const overtimeHours = Math.max(0, totalHours - 40);
  
  return {
    ...timeSheet,
    entries: updatedEntries,
    totalHours,
    regularHours,
    overtimeHours
  };
};

export const useTimeSheets = () => {
  const [timeSheets, setTimeSheets] = useState<TimeSheet[]>([]);
  const { officers } = useData();
  
  // Load time sheets on component mount
  useEffect(() => {
    // In a real application, you would fetch these from an API
    // Process the time sheets to calculate actual hours worked
    const processedTimeSheets = sampleTimeSheets.map(calculateActualHours);
    setTimeSheets(processedTimeSheets);
  }, []);
  
  // Function to create a new time sheet entry from clock events
  const createTimeSheet = (employeeId: string, startDate: string, endDate: string) => {
    // Implementation would fetch clock events for the given employee and date range
    // and generate a timesheet
    toast({
      title: "Time Sheet Created",
      description: `New timesheet created for week of ${startDate}`,
      variant: "default",
    });
  };
  
  // Function to download time sheet as CSV
  const downloadTimeSheet = (weekLabel: string) => {
    try {
      const timeSheet = timeSheets.find(sheet => sheet.weekLabel === weekLabel);
      
      if (!timeSheet) {
        throw new Error("Time sheet not found");
      }
      
      // Find the associated officer if available
      const associatedOfficer = officers.find(officer => 
        officer.badgeNumber === timeSheet.employeeId || officer.name === timeSheet.employeeName
      );
      
      const officerInfo = associatedOfficer 
        ? `Officer: ${associatedOfficer.name}, Badge: ${associatedOfficer.badgeNumber}, Department: ${associatedOfficer.department}\n`
        : '';
      
      // Generate CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Employee Name,Week,Status,Regular Hours,Overtime Hours,Total Hours\n";
      csvContent += `${timeSheet.employeeName},${timeSheet.weekLabel},${timeSheet.status},${timeSheet.regularHours},${timeSheet.overtimeHours},${timeSheet.totalHours}\n\n`;
      
      // Add officer info if available
      if (officerInfo) {
        csvContent += officerInfo + "\n";
      }
      
      // Add daily entries
      csvContent += "Day,Hours Worked,Clock In,Clock Out,Breaks\n";
      timeSheet.entries.forEach(entry => {
        const breakInfo = entry.breaks.map(b => 
          `${b.type === 'paid10' ? '10min paid' : b.type === 'unpaid30' ? '30min lunch' : '1hr lunch'} (${b.startTime}-${b.endTime})`
        ).join('; ');
        
        csvContent += `${entry.day},${entry.hoursWorked},${entry.clockIn || 'N/A'},${entry.clockOut || 'N/A'},${breakInfo || 'None'}\n`;
      });
      
      // Add weekly summary
      csvContent += `\nWeekly Summary,,,Regular Hours: ${timeSheet.regularHours},Overtime Hours: ${timeSheet.overtimeHours},Total Hours: ${timeSheet.totalHours}\n`;
      
      // Create download link and trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Timesheet_${timeSheet.employeeName.replace(/\s+/g, '_')}_${timeSheet.weekLabel.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `Time sheet for ${timeSheet.employeeName} (${timeSheet.weekLabel}) is being downloaded`,
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error downloading time sheet:", error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download time sheet",
        variant: "destructive",
      });
    }
  };
  
  return {
    timeSheets,
    downloadTimeSheet,
    createTimeSheet,
  };
};
