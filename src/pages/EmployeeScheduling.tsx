
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Download, Plus, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleCalendar } from '@/components/scheduling/ScheduleCalendar';
import { TimeClockCard } from '@/components/scheduling/TimeClockCard';
import { TimeSheetTable } from '@/components/scheduling/TimeSheetTable';
import { AddScheduleDialog } from '@/components/scheduling/AddScheduleDialog';
import { useTimeSheets } from '@/hooks/scheduling/use-time-sheets';

const EmployeeScheduling = () => {
  const [activeTab, setActiveTab] = useState<string>('schedule');
  const [addScheduleOpen, setAddScheduleOpen] = useState(false);
  const { timeSheets, downloadTimeSheet } = useTimeSheets();
  const currentWeek = format(new Date(), "'Week of' MMM d, yyyy");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Scheduling</h1>
          <p className="text-muted-foreground">Manage schedules and track work hours</p>
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === 'schedule' && (
            <Button 
              onClick={() => setAddScheduleOpen(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Schedule
            </Button>
          )}
          
          {activeTab === 'timesheets' && (
            <Button 
              variant="outline" 
              onClick={() => downloadTimeSheet(currentWeek)}
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Schedules</span>
          </TabsTrigger>
          <TabsTrigger value="timeclock" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Time Clock</span>
          </TabsTrigger>
          <TabsTrigger value="timesheets" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Time Sheets</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +2 since last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Shifts This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground">
                  12 pending approvals
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Hours Scheduled</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">182</div>
                <p className="text-xs text-muted-foreground">
                  Across all departments
                </p>
              </CardContent>
            </Card>
          </div>
          
          <ScheduleCalendar />
        </TabsContent>
        
        <TabsContent value="timeclock" className="mt-6 space-y-4">
          <TimeClockCard />
        </TabsContent>
        
        <TabsContent value="timesheets" className="mt-6 space-y-4">
          <TimeSheetTable timeSheets={timeSheets} onDownload={downloadTimeSheet} />
        </TabsContent>
      </Tabs>
      
      <AddScheduleDialog open={addScheduleOpen} onOpenChange={setAddScheduleOpen} />
    </div>
  );
};

export default EmployeeScheduling;
