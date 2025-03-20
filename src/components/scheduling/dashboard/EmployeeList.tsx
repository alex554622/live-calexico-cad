
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Employee, EmployeeBreak } from '@/types/scheduling';
import { format, formatDistanceToNow } from 'date-fns';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';
import { Alert, AlertCircle, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EmployeeListProps {
  employees: Employee[];
  activeBreaks: EmployeeBreak[];
  loading: boolean;
}

export function EmployeeList({ employees, activeBreaks, loading }: EmployeeListProps) {
  // Get elapsed time in minutes
  const getElapsedTime = (startTime: Date) => {
    return Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60));
  };

  if (loading) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        Loading employee data...
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No active employees</AlertTitle>
        <AlertDescription>
          There are currently no employees clocked in or on shift.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Clock In</TableHead>
          <TableHead>Duration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => {
          const isOnBreak = activeBreaks.some(b => 
            b.shiftId === employee.currentShift?.id
          );
          
          const currentBreak = activeBreaks.find(b => 
            b.shiftId === employee.currentShift?.id
          );
          
          return (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                {employee.name}
              </TableCell>
              <TableCell>
                {employee.position}
                <div className="text-xs text-muted-foreground">
                  {employee.department}
                </div>
              </TableCell>
              <TableCell>
                <EmployeeStatusBadge 
                  isOnBreak={isOnBreak}
                  breakType={currentBreak?.type}
                  elapsedMinutes={currentBreak ? getElapsedTime(currentBreak.startTime) : undefined}
                />
              </TableCell>
              <TableCell>
                {employee.currentShift?.clockIn ? 
                  format(employee.currentShift.clockIn, 'h:mm a') : 'N/A'}
                <div className="text-xs text-muted-foreground">
                  {employee.currentShift?.clockIn ? 
                    formatDistanceToNow(employee.currentShift.clockIn, { addSuffix: true }) : ''}
                </div>
              </TableCell>
              <TableCell>
                {employee.currentShift?.clockIn ? 
                  `${getElapsedTime(employee.currentShift.clockIn)}m` : 'N/A'}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
