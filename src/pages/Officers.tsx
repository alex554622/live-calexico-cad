import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Officer } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Plus, Phone, Mail, CheckSquare, Trash2 } from 'lucide-react';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';
import OfficerForm from '@/components/officers/OfficerForm';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const Officers = () => {
  const { officers, incidents, loadingOfficers, updateOfficer } = useData();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = 
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.badgeNumber.toString().includes(searchTerm) ||
      officer.rank.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || officer.status === statusFilter;
    const matchesRank = rankFilter === 'all' || officer.rank === rankFilter;
    
    return matchesSearch && matchesStatus && matchesRank;
  });

  const getOfficerIncident = (officer: Officer) => {
    if (!officer.currentIncidentId) return null;
    return incidents.find(incident => incident.id === officer.currentIncidentId);
  };

  const handleCreateSuccess = (newOfficer: Officer) => {
    setIsCreating(false);
    setSelectedOfficer(newOfficer);
  };

  const handleEditSuccess = (updatedOfficer: Officer) => {
    setIsEditing(false);
    setSelectedOfficer(updatedOfficer);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedOfficers([]);
    }
  };

  const toggleOfficerSelection = (id: string, e: React.MouseEvent) => {
    if (!isSelectionMode) return;
    
    e.stopPropagation();
    setSelectedOfficers(prev => {
      if (prev.includes(id)) {
        return prev.filter(officerId => officerId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedOfficers) {
        await updateOfficer(id, { status: 'offDuty' });
      }
      
      toast({
        title: 'Officers Set to Off Duty',
        description: `${selectedOfficers.length} officer(s) have been set to off duty`,
      });
      
      setSelectedOfficers([]);
      setIsSelectionMode(false);
      setIsConfirmingDelete(false);
    } catch (error) {
      console.error('Error updating officers:', error);
      toast({
        title: 'Error',
        description: 'Failed to update selected officers',
        variant: 'destructive',
      });
    }
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
        <div className="flex gap-2">
          {hasPermission('createOfficer') && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-1" /> New Officer
            </Button>
          )}
          {hasPermission('editOfficer') && (
            <Button 
              variant={isSelectionMode ? "secondary" : "outline"} 
              onClick={toggleSelectionMode}
            >
              <CheckSquare className="h-4 w-4 mr-1" /> 
              {isSelectionMode ? "Cancel Selection" : "Select Officers"}
            </Button>
          )}
          {isSelectionMode && selectedOfficers.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Set Off Duty
            </Button>
          )}
        </div>
      </div>

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
              <SelectItem value="responding">Responding</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="offDuty">Off Duty</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={rankFilter}
            onValueChange={setRankFilter}
          >
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Rank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ranks</SelectItem>
              {uniqueRanks.map(rank => (
                <SelectItem key={rank} value={rank}>{rank}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingOfficers ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <p>Loading officers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOfficers.map(officer => {
            const currentIncident = getOfficerIncident(officer);
            return (
              <div
                key={officer.id}
                className={`border rounded-lg overflow-hidden hover:border-primary transition-colors ${
                  isSelectionMode ? 'cursor-default' : 'cursor-pointer'
                } ${selectedOfficers.includes(officer.id) ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => !isSelectionMode && setSelectedOfficer(officer)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {isSelectionMode && (
                        <Checkbox 
                          checked={selectedOfficers.includes(officer.id)} 
                          onCheckedChange={() => toggleOfficerSelection(officer.id, { stopPropagation: () => {} } as React.MouseEvent)}
                          onClick={(e) => e.stopPropagation()}
                          className="mr-2"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{officer.name}</h3>
                        <p className="text-sm text-muted-foreground">{officer.rank} • Badge #{officer.badgeNumber}</p>
                      </div>
                    </div>
                    <OfficerStatusBadge status={officer.status} />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{officer.contactInfo?.phone || 'No phone available'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{officer.contactInfo?.email || 'No email available'}</span>
                    </div>
                  </div>
                  
                  {currentIncident && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium">Current Incident:</p>
                      <p className="text-sm truncate">{currentIncident.title}</p>
                      <p className="text-xs text-muted-foreground">{currentIncident.location.address}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Officer</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new officer to the system.
            </DialogDescription>
          </DialogHeader>
          
          <OfficerForm 
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedOfficer} onOpenChange={(open) => !open && setSelectedOfficer(null)}>
        {selectedOfficer && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedOfficer.name}</span>
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
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">{selectedOfficer.rank} • Badge #{selectedOfficer.badgeNumber}</span>
                <OfficerStatusBadge status={selectedOfficer.status} />
              </div>
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
                  <div>
                    <h3 className="text-sm font-medium mb-1">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm">{selectedOfficer.contactInfo?.phone || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm">{selectedOfficer.contactInfo?.email || 'Not available'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Department</h3>
                    <p className="text-sm">{selectedOfficer.department}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Shift Schedule</h3>
                    <p className="text-sm">{selectedOfficer.shiftSchedule || "No shift scheduled"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                    <p className="text-sm">{format(new Date(selectedOfficer.lastUpdated), 'MMM d, h:mm a')}</p>
                  </div>
                  
                  {selectedOfficer.currentIncidentId && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Current Incident</h3>
                      <div className="text-sm p-3 bg-muted rounded-md">
                        {incidents.find(i => i.id === selectedOfficer.currentIncidentId)?.title || 'Loading...'}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="incidents">
                  <div className="py-4">
                    <h3 className="text-sm font-medium mb-3">Incident History</h3>
                    
                    {incidents.filter(incident => 
                      incident.assignedOfficers.includes(selectedOfficer.id)
                    ).length > 0 ? (
                      <div className="space-y-3">
                        {incidents
                          .filter(incident => incident.assignedOfficers.includes(selectedOfficer.id))
                          .map(incident => (
                            <div key={incident.id} className="border rounded-md p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{incident.title}</h4>
                                  <p className="text-xs text-muted-foreground">{incident.location.address}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">{format(new Date(incident.reportedAt), 'MMM d')}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No incident history found for this officer
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to set {selectedOfficers.length} selected officer(s) to off duty status?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSelected}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Officers;
