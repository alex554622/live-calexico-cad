
import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import { AlertTriangle, Users, Clock, Shield } from 'lucide-react';

interface DashboardStatsProps {
  activeIncidentsCount: number;
  availableOfficersCount: number;
  respondingOfficersCount: number;
  totalOfficersCount: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  activeIncidentsCount,
  availableOfficersCount,
  respondingOfficersCount,
  totalOfficersCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Active Incidents"
        value={activeIncidentsCount}
        icon={AlertTriangle}
        iconClassName="text-status-responding"
      />
      <StatCard
        title="Available Officers"
        value={availableOfficersCount}
        icon={Users}
        iconClassName="text-status-available"
      />
      <StatCard
        title="Responding Officers"
        value={respondingOfficersCount}
        icon={Clock}
        iconClassName="text-status-busy"
      />
      <StatCard
        title="Total Officers"
        value={totalOfficersCount}
        icon={Shield}
        iconClassName="text-police"
      />
    </div>
  );
};

export default DashboardStats;
