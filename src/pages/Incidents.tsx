
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Incident } from '@/types';
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
import { AlertTriangle, Search, Filter, MapPin, Clock, FileText } from 'lucide-react';
import IncidentStatusBadge from '@/components/common/IncidentStatusBadge';
import IncidentPriorityBadge from '@/components/common/IncidentPriorityBadge';
import { format } from 'date-fns';

const Incidents = () => {
  const { incidents, officers, loadingIncidents, loadingOfficers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Filter incidents based on search term and filters
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || incident.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
        <p className="text-muted-foreground">
          View and manage all incidents in the system.
        </p>
      </div>

      {/* Search and filters */}
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
                  className="p-4 hover:bg-muted rounded-md cursor-pointer transition-colors"
                  onClick={() => setSelectedIncident(incident)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{incident.title}</h3>
                        <IncidentPriorityBadge priority={incident.priority} />
                        <IncidentStatusBadge status={incident.status} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{incident.description}</p>
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Incident Details Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
        {selectedIncident && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedIncident.title}</DialogTitle>
              <div className="flex space-x-2 mt-2">
                <IncidentPriorityBadge priority={selectedIncident.priority} />
                <IncidentStatusBadge status={selectedIncident.status} />
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="officers">Officers</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
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
                    <p className="text-sm">{
                      selectedIncident.reportedBy
                    }</p>
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
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="timeline">
                <div className="py-8 text-center text-muted-foreground">
                  Timeline feature coming soon
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Incidents;
