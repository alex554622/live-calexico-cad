
import React from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const ExportIncidents = () => {
  const { incidents, officers } = useData();

  const downloadAsExcel = () => {
    // Format incidents for Excel
    const formattedIncidents = incidents.map(incident => {
      // Get officer names for this incident
      const assignedOfficerNames = incident.assignedOfficers
        .map(officerId => {
          const officer = officers.find(o => o.id === officerId);
          return officer ? officer.name : 'Unknown Officer';
        })
        .join(', ');

      return {
        ID: incident.id,
        Title: incident.title,
        Description: incident.description,
        Location: incident.location.address,
        Priority: incident.priority,
        Status: incident.status,
        'Assigned Officers': assignedOfficerNames || 'None',
        'Reported At': format(new Date(incident.reportedAt), 'MMM d, yyyy h:mm a'),
        'Updated At': format(new Date(incident.updatedAt), 'MMM d, yyyy h:mm a'),
        'Reported By': incident.reportedBy || 'Unknown'
      };
    });

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
      variant="excel" 
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Export to Excel
    </Button>
  );
};

export default ExportIncidents;
