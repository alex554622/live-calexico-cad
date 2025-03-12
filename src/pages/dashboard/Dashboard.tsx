
import React from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import DashboardStats from './DashboardStats';
import OfficersSection from './OfficersSection';
import IncidentsSection from './IncidentsSection';
import OfficerDetailsDialog from './OfficerDetailsDialog';
import IncidentDetailsDialog from './IncidentDetailsDialog';
import { Officer, Incident } from '@/types';

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
          <DashboardStats 
            activeIncidentsCount={activeIncidents.length}
            availableOfficersCount={availableOfficers.length}
            respondingOfficersCount={respondingOfficers.length}
            totalOfficersCount={officers.length}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OfficersSection 
              officers={officers} 
              onOfficerClick={setSelectedOfficer} 
            />
            
            <IncidentsSection 
              incidents={incidents} 
              onIncidentClick={setSelectedIncident} 
            />
          </div>
        </>
      )}
      
      <OfficerDetailsDialog 
        officer={selectedOfficer} 
        incidents={incidents}
        onClose={() => setSelectedOfficer(null)} 
      />
      
      <IncidentDetailsDialog 
        incident={selectedIncident} 
        officers={officers}
        onClose={() => setSelectedIncident(null)} 
      />
    </div>
  );
};

export default Dashboard;
