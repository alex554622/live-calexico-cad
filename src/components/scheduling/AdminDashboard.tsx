
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Employee, EmployeeBreak } from '@/types/scheduling';
import { format, formatDistanceToNow } from 'date-fns';
import { Coffee, Clock, Users, Search, UserCheck, AlertCircle } from 'lucide-react';
import { useEmployeeShifts } from '@/hooks/scheduling/use-employee-shifts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AdminDashboard() {
  const { 
    employees, 
    activeShifts, 
    activeBreaks, 
    loading,
    refreshData
  } = useEmployeeShifts();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter employees based on search query
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Count employees by status
  const totalOnShift = activeShifts.length;
  const totalOnBreak = activeBreaks.length;
  const totalActive = totalOnShift - totalOnBreak;
  
  // Get break type label
  const getBreakTypeLabel = (breakType: string) => {
    switch (breakType) {
      case 'paid10': return '10-min Paid';
      case 'unpaid30': return '30-min Lunch';
      case 'unpaid60': return '1-hour Lunch';
      default: return breakType;
    }
  };
  
  // Get elapsed time in minutes
  const getElapsedTime = (startTime: Date) => {
    return Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employee Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor active employees and their current status
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={refreshData}
          className="gap-2"
        >
          <Clock className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>
      
      {/* Stats section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Employees
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActive}</div>
            <p className="text-xs text-muted-foreground">
              Currently clocked in and working
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              On Break
            </CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOnBreak}</div>
            <p className="text-xs text-muted-foreground">
              Currently on various breaks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Scheduled
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOnShift}</div>
            <p className="text-xs text-muted-foreground">
              Total employees on shift today
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Employee list */}
      <Card>
        <CardHeader>
          <CardTitle>Active Employees</CardTitle>
          <CardDescription>
            Real-time status of employees currently on shift
          </CardDescription>
          
          <div className="mt-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading employee data...
            </div>
          ) : employees.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No active employees</AlertTitle>
              <AlertDescription>
                There are currently no employees clocked in or on shift.
              </AlertDescription>
            </Alert>
          ) : (
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
                {filteredEmployees.map((employee) => {
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
                        {isOnBreak ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            {getBreakTypeLabel(currentBreak?.type || '')} Break ({getElapsedTime(currentBreak?.startTime as Date)}m)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        )}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
