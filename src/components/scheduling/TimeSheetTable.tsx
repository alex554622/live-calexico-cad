
import React, { useState } from 'react';
import { Download, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TimeSheet } from '@/types/scheduling';

interface TimeSheetTableProps {
  timeSheets: TimeSheet[];
  onDownload: (weekLabel: string) => void;
}

export const TimeSheetTable = ({ timeSheets, onDownload }: TimeSheetTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSheets, setExpandedSheets] = useState<string[]>([]);
  
  // Filter time sheets by employee name or week
  const filteredTimeSheets = timeSheets.filter(sheet => 
    sheet.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.weekLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const toggleExpand = (sheetId: string) => {
    setExpandedSheets(prev => 
      prev.includes(sheetId) 
        ? prev.filter(id => id !== sheetId) 
        : [...prev, sheetId]
    );
  };
  
  const isExpanded = (sheetId: string) => expandedSheets.includes(sheetId);
  
  // Format hours with one decimal place
  const formatHours = (hours: number) => hours.toFixed(1);
  
  // Format break type to be more human-readable
  const formatBreakType = (type: string) => {
    switch (type) {
      case 'paid10': return '10m (paid)';
      case 'unpaid30': return '30m lunch';
      case 'unpaid60': return '1h lunch';
      default: return type;
    }
  };
  
  // Get CSS class for timesheet status
  const getStatusClass = (status: 'approved' | 'pending' | 'rejected') => {
    switch (status) {
      case 'approved': 
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'rejected': 
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  };
  
  // Calculate total break time for a day
  const calculateBreakTime = (breaks: any[]) => {
    return breaks.reduce((total, breakItem) => total + breakItem.duration, 0);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="max-w-sm">
          <Input
            placeholder="Search by employee or week..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredTimeSheets.length} time sheets found
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Week</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Regular Hours</TableHead>
              <TableHead className="text-right">Overtime</TableHead>
              <TableHead className="text-right">Total Hours</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTimeSheets.length > 0 ? (
              filteredTimeSheets.map((sheet) => (
                <React.Fragment key={sheet.id}>
                  <TableRow className="cursor-pointer" onClick={() => toggleExpand(sheet.id)}>
                    <TableCell>
                      {isExpanded(sheet.id) ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </TableCell>
                    <TableCell className="font-medium">{sheet.employeeName}</TableCell>
                    <TableCell>{sheet.weekLabel}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClass(sheet.status)}`}>
                        {sheet.status.charAt(0).toUpperCase() + sheet.status.slice(1)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatHours(sheet.regularHours || sheet.totalHours)}</TableCell>
                    <TableCell className="text-right">{formatHours(sheet.overtimeHours || 0)}</TableCell>
                    <TableCell className="text-right">{formatHours(sheet.totalHours)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(sheet.weekLabel);
                        }}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {isExpanded(sheet.id) && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0">
                        <div className="p-4 bg-muted/20">
                          <h4 className="font-medium mb-2">Daily Breakdown</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Day</TableHead>
                                <TableHead>Clock In</TableHead>
                                <TableHead>Clock Out</TableHead>
                                <TableHead>Breaks</TableHead>
                                <TableHead>Break Time</TableHead>
                                <TableHead className="text-right">Hours</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sheet.entries.map((entry, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{entry.day}</TableCell>
                                  <TableCell>{entry.clockIn || 'N/A'}</TableCell>
                                  <TableCell>{entry.clockOut || 'N/A'}</TableCell>
                                  <TableCell>
                                    {entry.breaks && entry.breaks.length > 0 ? (
                                      <div className="text-xs space-y-1">
                                        {entry.breaks.map((breakItem, i) => (
                                          <div key={i} className="flex gap-2">
                                            <span>
                                              {formatBreakType(breakItem.type)}
                                            </span>
                                            <span className="text-muted-foreground">
                                              {breakItem.startTime} - {breakItem.endTime}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">None</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {entry.breaks && entry.breaks.length > 0 ? (
                                      <span className="text-xs">
                                        {calculateBreakTime(entry.breaks)} min
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">0 min</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">{formatHours(entry.hoursWorked)}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell colSpan={5} className="font-medium text-right">Weekly Total:</TableCell>
                                <TableCell className="text-right font-bold">{formatHours(sheet.totalHours)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No time sheets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
