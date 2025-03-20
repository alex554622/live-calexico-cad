
import React from 'react';
import { Coffee, UserCheck, Users } from 'lucide-react';
import { StatsCard } from './StatsCard';

interface DashboardStatsProps {
  totalActive: number;
  totalOnBreak: number;
  totalOnShift: number;
}

export function DashboardStats({ totalActive, totalOnBreak, totalOnShift }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard
        title="Active Employees"
        value={totalActive}
        description="Currently clocked in and working"
        icon={UserCheck}
      />
      
      <StatsCard
        title="On Break"
        value={totalOnBreak}
        description="Currently on various breaks"
        icon={Coffee}
      />
      
      <StatsCard
        title="Total Scheduled"
        value={totalOnShift}
        description="Total employees on shift today"
        icon={Users}
      />
    </div>
  );
}
