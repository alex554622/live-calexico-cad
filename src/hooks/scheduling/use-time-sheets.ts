
import { useState, useEffect } from 'react';
import { TimeSheet } from '@/types/scheduling';
import { toast } from '@/hooks/use-toast';

// Sample data
const sampleTimeSheets: TimeSheet[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    weekLabel: 'Week of Oct 2, 2023',
    startDate: '2023-10-02',
    endDate: '2023-10-08',
    totalHours: 40.0,
    status: 'approved',
    entries: [
      { day: 'Monday', hoursWorked: 8, clockIn: '09:00', clockOut: '17:00' },
      { day: 'Tuesday', hoursWorked: 8, clockIn: '09:00', clockOut: '17:00' },
      { day: 'Wednesday', hoursWorked: 8, clockIn: '09:00', clockOut: '17:00' },
      { day: 'Thursday', hoursWorked: 8, clockIn: '09:00', clockOut: '17:00' },
      { day: 'Friday', hoursWorked: 8, clockIn: '09:00', clockOut: '17:00' },
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
    status: 'pending',
    entries: [
      { day: 'Monday', hoursWorked: 7.5, clockIn: '09:30', clockOut: '17:00' },
      { day: 'Tuesday', hoursWorked: 8, clockIn: '09:00', clockOut: '17:00' },
      { day: 'Wednesday', hoursWorked: 9, clockIn: '08:00', clockOut: '17:00' },
      { day: 'Thursday', hoursWorked: 8, clockIn: '09:00', clockOut: '17:00' },
      { day: 'Friday', hoursWorked: 0, clockIn: '', clockOut: '' },
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
    status: 'approved',
    entries: [
      { day: 'Monday', hoursWorked: 8, clockIn: '09:00', clockOut: '17:00' },
      { day: 'Tuesday', hoursWorked: 10, clockIn: '08:00', clockOut: '18:00' },
      { day: 'Wednesday', hoursWorked: 8, clockIn: '09:00', clockOut: '17:00' },
      { day: 'Thursday', hoursWorked: 10, clockIn: '08:00', clockOut: '18:00' },
      { day: 'Friday', hoursWorked: 8, clockIn: '09:00', clockOut: '17:00' },
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
    status: 'rejected',
    entries: [
      { day: 'Monday', hoursWorked: 4, clockIn: '09:00', clockOut: '13:00' },
      { day: 'Tuesday', hoursWorked: 4, clockIn: '09:00', clockOut: '13:00' },
      { day: 'Wednesday', hoursWorked: 4, clockIn: '09:00', clockOut: '13:00' },
      { day: 'Thursday', hoursWorked: 4, clockIn: '09:00', clockOut: '13:00' },
      { day: 'Friday', hoursWorked: 4, clockIn: '09:00', clockOut: '13:00' },
    ]
  }
];

export const useTimeSheets = () => {
  const [timeSheets, setTimeSheets] = useState<TimeSheet[]>([]);
  
  // Load time sheets on component mount
  useEffect(() => {
    // In a real application, you would fetch these from an API
    setTimeSheets(sampleTimeSheets);
  }, []);
  
  // Function to download time sheet as CSV
  const downloadTimeSheet = (weekLabel: string) => {
    try {
      const timeSheet = timeSheets.find(sheet => sheet.weekLabel === weekLabel);
      
      if (!timeSheet) {
        throw new Error("Time sheet not found");
      }
      
      // Generate CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Employee Name,Week,Status,Total Hours\n";
      csvContent += `${timeSheet.employeeName},${timeSheet.weekLabel},${timeSheet.status},${timeSheet.totalHours}\n\n`;
      
      // Add daily entries
      csvContent += "Day,Hours Worked,Clock In,Clock Out\n";
      timeSheet.entries.forEach(entry => {
        csvContent += `${entry.day},${entry.hoursWorked},${entry.clockIn || 'N/A'},${entry.clockOut || 'N/A'}\n`;
      });
      
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
  };
};
