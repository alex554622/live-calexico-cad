
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Officer, Incident } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, MapPin, Clock, UserPlus } from 'lucide-react';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';
import OfficerForm from '@/components/officers/OfficerForm';
import { format } from 'date-fns';

const Officers = () => {
  const { officers, incidents, loadingOfficers, loadingIncidents } = useData();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Filter officers based on search term and status filter
  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = 
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.rank.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || officer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get current incident for an officer
  const getCurrentIncident = (officerId: string): Incident | undefined => {
    const officer = officers.find(o => o.id === officerId);
    if (officer?.currentIncidentId) {
      return incidents.find(i => i.id === officer.currentIncidentId);
    }
    return undefined;
  };

  const handleCreateSuccess = (newOfficer: Officer) => {
    setIsCreating(false);
    setSelectedOfficer(newOfficer);
  };

  const handleEditSuccess = (updatedOfficer: Officer) => {
    setIsEditing(false);
    setSelectedOfficer(updatedOfficer);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Officers</h1>
          <p className="text-muted-foreground">
            View and manage all officers in the system.
          </p>
        </div>
        {hasPermission('createOfficer') && (
          <Button onClick={() => setIsCreating(true)}>
            <UserPlus className="h-4 w-4 mr-1" /> New Officer
          </Button>
        )}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search officers..."
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
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="responding">Responding</SelectItem>
              <SelectItem value="offDuty">Off Duty</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingOfficers || loadingIncidents ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <p>Loading officers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOfficers.map((officer) => {
            const currentIncident = getCurrentIncident(officer.id);
            
            return (
              <div
                key={officer.id}
                className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                onClick={() => hasPermission('viewOfficerDetails') && setSelectedOfficer(officer)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3 bg-police text-white">
                      <AvatarFallback>
                        {officer.name.split(' ')[0][0] + (officer.name.split(' ')[1]?.[0] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{officer.name}</h3>
                      <p className="text-sm text-muted-foreground">{officer.rank}</p>
                    </div>
                  </div>
                  <OfficerStatusBadge status={officer.status} />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Badge:</span>
                    <span className="font-medium">{officer.badgeNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span>{officer.department}</span>
                  </div>
                  
                  {currentIncident && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Current Incident:</p>
                      <p className="text-sm font-medium truncate">{currentIncident.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{currentIncident.location.address}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Officer Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Officer</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new officer.
            </DialogDescription>
          </DialogHeader>
          
          <OfficerForm 
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Officer Details Dialog */}
      <Dialog open={!!selectedOfficer} onOpenChange={(open) => !open && setSelectedOfficer(null)}>
        {selectedOfficer && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Officer Details</span>
                {hasPermission('editOfficer') && (
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
              </DialogTitle>
            </DialogHeader>
            
            {isEditing ? (
              <OfficerForm 
                initialData={selectedOfficer}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="incidents">Incidents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 py-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 bg-police text-white">
                      <AvatarFallback>
                        {selectedOfficer.name.split(' ')[0][0] + (selectedOfficer.name.split(' ')[1]?.[0] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium">{selectedOfficer.name}</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">{selectedOfficer.rank}</p>
                        <OfficerStatusBadge status={selectedOfficer.status} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Badge Number</p>
                      <p className="text-sm">{selectedOfficer.badgeNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm">{selectedOfficer.department}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm">{format(new Date(selectedOfficer.lastUpdated), 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                  
                  {selectedOfficer.currentIncidentId && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium mb-2">Current Incident</p>
                      {incidents.find(i => i.id === selectedOfficer.currentIncidentId) ? (
                        <div className="rounded-md border p-3">
                          <p className="font-medium">
                            {incidents.find(i => i.id === selectedOfficer.currentIncidentId)?.title}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>
                              {incidents.find(i => i.id === selectedOfficer.currentIncidentId)?.location.address}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              Reported: {format(
                                new Date(incidents.find(i => i.id === selectedOfficer.currentIncidentId)?.reportedAt || ''),
                                'MMM d, h:mm a'
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Incident information not available</p>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="incidents">
                  <div className="py-4">
                    <h3 className="text-sm font-medium mb-3">Recent Incidents</h3>
                    
                    {incidents.filter(incident => 
                      incident.assignedOfficers.includes(selectedOfficer.id)
                    ).length > 0 ? (
                      <div className="space-y-3">
                        {incidents
                          .filter(incident => incident.assignedOfficers.includes(selectedOfficer.id))
                          .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
                          .slice(0, 5)
                          .map(incident => (
                            <div key={incident.id} className="border rounded-md p-3">
                              <div className="flex justify-between items-start">
                                <p className="font-medium">{incident.title}</p>
                                <div className="flex space-x-1">
                                  <OfficerStatusBadge status={
                                    selectedOfficer.currentIncidentId === incident.id 
                                      ? selectedOfficer.status 
                                      : 'available'
                                  } />
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {incident.description}
                              </p>
                              <div className="flex items-center text-xs text-muted-foreground mt-2">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{format(new Date(incident.reportedAt), 'MMM d, h:mm a')}</span>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No incidents have been assigned to this officer
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Officers;
