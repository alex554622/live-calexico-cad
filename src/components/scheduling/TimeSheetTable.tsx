
import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
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
import { TimeSheet } from '@/types/scheduling';

interface TimeSheetTableProps {
  timeSheets: TimeSheet[];
  onDownload: (weekLabel: string) => void;
}

export const TimeSheetTable = ({ timeSheets, onDownload }: TimeSheetTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter time sheets by employee name or week
  const filteredTimeSheets = timeSheets.filter(sheet => 
    sheet.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.weekLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
              <TableHead>Employee</TableHead>
              <TableHead>Week</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Hours</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTimeSheets.length > 0 ? (
              filteredTimeSheets.map((sheet) => (
                <TableRow key={sheet.id}>
                  <TableCell className="font-medium">{sheet.employeeName}</TableCell>
                  <TableCell>{sheet.weekLabel}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      sheet.status === 'approved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : sheet.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {sheet.status.charAt(0).toUpperCase() + sheet.status.slice(1)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{sheet.totalHours.toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(sheet.weekLabel)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
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
