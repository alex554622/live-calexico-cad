
import React from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Incident } from '@/types';

const ExportIncidents = () => {
  const { incidents } = useData();

  const downloadAsExcel = () => {
    // Format incidents for Excel
    const formattedIncidents = incidents.map(incident => ({
      ID: incident.id,
      Title: incident.title,
      Description: incident.description,
      Location: incident.location,
      Priority: incident.priority,
      Status: incident.status,
      'Assigned Officer': incident.assignedOfficer?.name || 'None',
      'Reported At': new Date(incident.reportedAt).toLocaleString(),
      'Updated At': new Date(incident.updatedAt).toLocaleString(),
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedIncidents);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents');
    
    // Generate file name with current date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `incidents_export_${date}.xlsx`;
    
    // Export to Excel file
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Button 
      onClick={downloadAsExcel} 
      variant="outline" 
      className="flex items-center gap-2"
    >
      <Download size={16} />
      Export to Excel
    </Button>
  );
};

export default ExportIncidents;
