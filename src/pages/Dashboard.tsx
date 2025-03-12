
import React from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/dashboard/StatCard';
import OfficerCard from '@/components/dashboard/OfficerCard';
import IncidentCard from '@/components/dashboard/IncidentCard';
import { 
  AlertTriangle, 
  Users, 
  Clock, 
  Shield
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Officer, Incident } from '@/types';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';
import IncidentPriorityBadge from '@/components/common/IncidentPriorityBadge';
import IncidentStatusBadge from '@/components/common/IncidentStatusBadge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { officers, incidents, loadingOfficers, loadingIncidents } = useData();
  const { user } = useAuth();
  
  const [selectedOfficer, setSelectedOfficer] = React.useState<Officer | null>(null);
  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);
  
  // Filter active incidents
  const activeIncidents = incidents.filter(
    (incident) => incident.status === 'active' || incident.status === 'pending'
  );
  
  const availableOfficers = officers.filter(
    (officer) => officer.status === 'available'
  );
  
  const respondingOfficers = officers.filter(
    (officer) => officer.status === 'responding'
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here's what's happening today.
        </p>
      </div>
      
      {loadingOfficers || loadingIncidents ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Incidents"
              value={activeIncidents.length}
              icon={AlertTriangle}
              iconClassName="text-status-responding"
            />
            <StatCard
              title="Available Officers"
              value={availableOfficers.length}
              icon={Users}
              iconClassName="text-status-available"
            />
            <StatCard
              title="Responding Officers"
              value={respondingOfficers.length}
              icon={Clock}
              iconClassName="text-status-busy"
            />
            <StatCard
              title="Total Officers"
              value={officers.length}
              icon={Shield}
              iconClassName="text-police"
            />
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Officers Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Officers</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {officers.slice(0, 6).map((officer) => (
                  <OfficerCard 
                    key={officer.id} 
                    officer={officer} 
                    onClick={() => setSelectedOfficer(officer)}
                  />
                ))}
              </div>
            </div>
            
            {/* Incidents Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Incidents</h2>
              </div>
              <div className="space-y-4">
                {incidents.slice(0, 4).map((incident) => (
                  <IncidentCard 
                    key={incident.id} 
                    incident={incident} 
                    onClick={() => setSelectedIncident(incident)}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Officer Details Dialog */}
      <Dialog open={!!selectedOfficer} onOpenChange={() => setSelectedOfficer(null)}>
        {selectedOfficer && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Officer Details</DialogTitle>
              <DialogDescription>
                Information about {selectedOfficer.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-police text-white flex items-center justify-center font-bold text-lg">
                  {selectedOfficer.name.split(' ')[0][0] + (selectedOfficer.name.split(' ')[1]?.[0] || '')}
                </div>
                <div>
                  <h3 className="font-medium">{selectedOfficer.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedOfficer.rank}</p>
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
                  <p className="text-sm font-medium">Status</p>
                  <OfficerStatusBadge status={selectedOfficer.status} />
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm">{format(new Date(selectedOfficer.lastUpdated), 'h:mm a')}</p>
                </div>
              </div>
              
              {selectedOfficer.currentIncidentId && (
                <div>
                  <p className="text-sm font-medium">Current Incident</p>
                  <p className="text-sm">{
                    incidents.find(i => i.id === selectedOfficer.currentIncidentId)?.title || 'Unknown'
                  }</p>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Incident Details Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        {selectedIncident && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedIncident.title}</DialogTitle>
              <div className="flex space-x-2 mt-2">
                <IncidentPriorityBadge priority={selectedIncident.priority} />
                <IncidentStatusBadge status={selectedIncident.status} />
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="officers">Assigned Officers</TabsTrigger>
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
                </div>
              </TabsContent>
              
              <TabsContent value="officers">
                {selectedIncident.assignedOfficers.length > 0 ? (
                  <div className="space-y-3 py-4">
                    {selectedIncident.assignedOfficers.map(officerId => {
                      const officer = officers.find(o => o.id === officerId);
                      if (!officer) return null;
                      
                      return (
                        <div key={officer.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div>
                            <p className="font-medium">{officer.name}</p>
                            <p className="text-sm text-muted-foreground">{officer.rank}</p>
                          </div>
                          <OfficerStatusBadge status={officer.status} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    No officers assigned to this incident
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Dashboard;
