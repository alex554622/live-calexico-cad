
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportIncidentsToCSV, exportIncidentsToDoc } from '@/services/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';

const ExportIncidentsButton = () => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    try {
      setExporting(true);
      const csvContent = exportIncidentsToCSV();
      const fileName = `incidents_${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csvContent, fileName, 'text/csv');
      
      toast({
        title: 'Export Successful',
        description: 'Incidents exported to CSV for Google Sheets',
      });
    } catch (error) {
      console.error('Error exporting incidents:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the incidents',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportDoc = () => {
    try {
      setExporting(true);
      const docContent = exportIncidentsToDoc();
      const fileName = `incidents_report_${new Date().toISOString().split('T')[0]}.txt`;
      downloadFile(docContent, fileName, 'text/plain');
      
      toast({
        title: 'Export Successful',
        description: 'Incidents exported to text format for Google Docs',
      });
    } catch (error) {
      console.error('Error exporting incidents:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the incidents',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export Incidents'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          Export to CSV (Google Sheets)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportDoc}>
          Export to Text (Google Docs)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportIncidentsButton;
