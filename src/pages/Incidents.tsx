
import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/auth';
import { Incident, Officer } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Search, Filter, MapPin, Clock, FileText, Plus, ExternalLink, CheckSquare, Trash2, Download } from 'lucide-react';
import IncidentStatusBadge from '@/components/common/IncidentStatusBadge';
import IncidentPriorityBadge from '@/components/common/IncidentPriorityBadge';
import IncidentForm from '@/components/incidents/IncidentForm';
import ExportIncidents from '@/components/incidents/ExportIncidents';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const Incidents = () => {
  const { incidents, officers, loadingIncidents, loadingOfficers, assignOfficerToIncident, updateIncident, deleteIncident } = useData();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [assigningInProgress, setAssigningInProgress] = useState(false);
  
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    const checkDataRetention = () => {
      const dataRetention = parseInt(localStorage.getItem('dataRetention') || '5');
      const now = new Date();
      
      const outdatedIncidents = incidents.filter(incident => {
        const reportedAt = new Date(incident.reportedAt);
        const daysDifference = Math.floor((now.getTime() - reportedAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysDifference > dataRetention;
      });

      if (outdatedIncidents.length > 0) {
        toast({
          title: 'Data Retention Notice',
          description: `${outdatedIncidents.length} incident(s) are older than ${dataRetention} days and will be deleted soon.`,
          variant: 'destructive',
        });
      }
    };

    checkDataRetention();
  }, [incidents, toast]);

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || incident.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateSuccess = (newIncident: Incident) => {
    setIsCreating(false);
    setSelectedIncident(newIncident);
  };

  const handleEditSuccess = (updatedIncident: Incident) => {
    setIsEditing(false);
    setSelectedIncident(updatedIncident);
  };

  const openDocumentLink = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAssignOfficer = async () => {
    if (!selectedIncident || !selectedOfficerId) return;
    
    try {
      setAssigningInProgress(true);
      await assignOfficerToIncident(selectedIncident.id, selectedOfficerId);
      
      toast({
        title: 'Officer Assigned',
        description: 'Officer has been successfully assigned to the incident',
      });
      
      setIsAssigning(false);
      setSelectedOfficerId('');
    } catch (error) {
      console.error('Error assigning officer:', error);
      toast({
        title: 'Assignment Failed',
        description: 'Failed to assign officer to the incident',
        variant: 'destructive',
      });
    } finally {
      setAssigningInProgress(false);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedIncidents([]);
    }
  };

  const toggleIncidentSelection = (id: string, e: React.MouseEvent) => {
    if (!isSelectionMode) return;
    
    e.stopPropagation();
    
    setSelectedIncidents(prev => {
      if (prev.includes(id)) {
        return prev.filter(incidentId => incidentId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedIncidents) {
        await deleteIncident(id);
      }
      
      toast({
        title: 'Incidents Deleted',
        description: `${selectedIncidents.length} incident(s) have been deleted`,
      });
      
      setSelectedIncidents([]);
      setIsSelectionMode(false);
      setIsConfirmingDelete(false);
    } catch (error) {
      console.error('Error deleting incidents:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete selected incidents',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    try {
      await deleteIncident(incidentId);
      
      toast({
        title: 'Incident Deleted',
        description: `Incident has been deleted successfully`,
      });
      
      setSelectedIncident(null);
    } catch (error) {
      console.error('Error deleting incident:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete incident',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadAllIncidents = () => {
    try {
      const incidentsData = JSON.stringify(incidents, null, 2);
      
      const blob = new Blob([incidentsData], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `incidents_export_${format(new Date(), 'yyyy-MM-dd')}.json`;
      
      document.body.appendChild(a);
      
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: 'All incidents have been exported successfully',
      });
    } catch (error) {
      console.error('Error exporting incidents:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export incidents',
        variant: 'destructive',
      });
    }
  };

  const availableOfficers = officers.filter(officer => 
    (officer.status === 'available' || !officer.currentIncidentId) && 
    officer.status !== 'offDuty'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">
            View and manage all incidents in the system.
          </p>
        </div>
        <div className="flex gap-2">
          <ExportIncidents />
          
          {hasPermission('createIncident') && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-1" /> New Incident
            </Button>
          )}
          {hasPermission('editIncident') && (
            <Button 
              variant={isSelectionMode ? "secondary" : "outline"} 
              onClick={toggleSelectionMode}
            >
              <CheckSquare className="h-4 w-4 mr-1" /> 
              {isSelectionMode ? "Cancel Selection" : "Select Incidents"}
            </Button>
          )}
          {isSelectionMode && selectedIncidents.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={setPriorityFilter}
          >
            <SelectTrigger className="w-[130px]">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingIncidents ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <p>Loading incidents...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.length === 0 ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="h-12 w-12 mb-2" />
              <p>No incidents found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`p-4 hover:bg-muted rounded-md ${isSelectionMode ? 'cursor-default' : 'cursor-pointer'} transition-colors ${
                    selectedIncidents.includes(incident.id) ? 'bg-muted' : ''
                  }`}
                  onClick={() => !isSelectionMode && setSelectedIncident(incident)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isSelectionMode && (
                        <Checkbox 
                          checked={selectedIncidents.includes(incident.id)} 
                          onCheckedChange={() => toggleIncidentSelection(incident.id, { stopPropagation: () => {} } as React.MouseEvent)}
                          onClick={(e) => e.stopPropagation()}
                          className="mr-2"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{incident.title}</h3>
                          <IncidentPriorityBadge priority={incident.priority} />
                          <IncidentStatusBadge status={incident.status} />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{incident.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-4">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[200px]">{incident.location.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{format(new Date(incident.reportedAt), 'MMM d, h:mm a')}</span>
                      </div>
                      {incident.documentLink && (
                        <div className="flex items-center text-blue-500">
                          <FileText className="h-3 w-3 mr-1" />
                          <span>Doc</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Incident</DialogTitle>
            <DialogDescription>
              Fill in the details below to report a new incident.
            </DialogDescription>
          </DialogHeader>
          
          <IncidentForm 
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
        {selectedIncident && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedIncident.title}</span>
                <div className="flex gap-2">
                  {hasPermission('editIncident') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  {hasPermission('deleteIncident') && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteIncident(selectedIncident.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  )}
                </div>
              </DialogTitle>
              <div className="flex space-x-2 mt-2">
                <IncidentPriorityBadge priority={selectedIncident.priority} />
                <IncidentStatusBadge status={selectedIncident.status} />
              </div>
            </DialogHeader>
            
            {isEditing ? (
              <IncidentForm 
                initialData={selectedIncident}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="officers">Officers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 py-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Description</h3>
                    <p className="text-sm">{selectedIncident.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Location</h3>
                    <p className="text-sm">{selectedIncident.location.address}</p>
                  </div>
                  
                  {selectedIncident.documentLink && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Documentation</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center text-blue-600"
                        onClick={() => openDocumentLink(selectedIncident.documentLink)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Document
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Reported At</h3>
                      <p className="text-sm">{format(new Date(selectedIncident.reportedAt), 'MMM d, h:mm a')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                      <p className="text-sm">{format(new Date(selectedIncident.updatedAt), 'MMM d, h:mm a')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Reported By</h3>
                      <p className="text-sm">{selectedIncident.reportedBy}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="officers">
                  {loadingOfficers ? (
                    <div className="py-8 text-center">Loading officers...</div>
                  ) : (
                    <>
                      {selectedIncident.assignedOfficers.length > 0 ? (
                        <div className="space-y-3 py-4">
                          {selectedIncident.assignedOfficers.map(officerId => {
                            const officer = officers.find(o => o.id === officerId);
                            if (!officer) return null;
                            
                            return (
                              <div key={officer.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div>
                                  <p className="font-medium">{officer.name}</p>
                                  <p className="text-sm text-muted-foreground">{officer.rank} • Badge #{officer.badgeNumber}</p>
                                </div>
                                <div className="flex items-center">
                                  <span className={`h-2 w-2 rounded-full mr-2 ${
                                    officer.status === 'available' ? 'bg-status-available' :
                                    officer.status === 'responding' ? 'bg-status-responding' :
                                    officer.status === 'busy' ? 'bg-status-busy' :
                                    'bg-gray-400'
                                  }`} />
                                  <span className="text-sm">{
                                    officer.status.charAt(0).toUpperCase() + officer.status.slice(1)
                                  }</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          No officers assigned to this incident
                        </div>
                      )}
                      
                      {hasPermission('assignOfficer') && (
                        <div className="pt-4">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsAssigning(true)}
                          >
                            Assign Officers
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="timeline">
                  <div className="py-8 text-center text-muted-foreground">
                    Timeline feature coming soon
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={isAssigning} onOpenChange={setIsAssigning}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Officer to Incident</DialogTitle>
            <DialogDescription>
              Select an available officer to assign to this incident.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {availableOfficers.length > 0 ? (
              <div className="space-y-4">
                <Select
                  value={selectedOfficerId}
                  onValueChange={setSelectedOfficerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an officer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOfficers.map(officer => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.name} - {officer.rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No available officers at the moment
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssigning(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignOfficer}
              disabled={!selectedOfficerId || assigningInProgress}
            >
              {assigningInProgress ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIncidents.length} selected incident(s)? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSelected}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Incidents;
