
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import IncidentStatusBadge from '@/components/common/IncidentStatusBadge';
import IncidentPriorityBadge from '@/components/common/IncidentPriorityBadge';
import { PlusCircle, MoreHorizontal, Info } from 'lucide-react';
import IncidentForm from '@/components/incidents/IncidentForm';
import ExportIncidentsButton from '@/components/incidents/ExportIncidentsButton';
import { format } from 'date-fns';
import { Incident } from '@/types';

const Incidents = () => {
  const { incidents, loadingIncidents } = useData();
  const { hasPermission } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  
  const handleAddIncident = () => {
    setSelectedIncident(null);
    setIsDialogOpen(true);
  };
  
  const handleViewIncident = (incidentId: string) => {
    setSelectedIncident(incidentId);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedIncident(null);
  };
  
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">
            Manage and track all reported incidents in the jurisdiction.
          </p>
        </div>
        <div className="flex space-x-2">
          <ExportIncidentsButton />
          
          {hasPermission('createIncident') && (
            <Button onClick={handleAddIncident}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Incident
            </Button>
          )}
        </div>
      </div>
      
      <Card className="mt-2">
        <CardHeader className="pb-2">
          <CardTitle>Incident Log</CardTitle>
          <CardDescription>
            A complete list of all incidents reported in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingIncidents ? (
            <div className="text-center p-4">Loading incidents...</div>
          ) : incidents.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              No incidents found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map(incident => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">{incident.id}</TableCell>
                    <TableCell>{incident.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {incident.location.address}
                    </TableCell>
                    <TableCell>
                      <IncidentStatusBadge status={incident.status} />
                    </TableCell>
                    <TableCell>
                      <IncidentPriorityBadge priority={incident.priority} />
                    </TableCell>
                    <TableCell>
                      {format(new Date(incident.reportedAt), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewIncident(incident.id)}>
                            <Info className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger className="hidden" />
        <DialogContent className="max-w-3xl">
          <IncidentForm 
            incidentId={selectedIncident || undefined} 
            onClose={handleCloseDialog} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Incidents;
