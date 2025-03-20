
import React from 'react';
import { useEmployeeShifts } from '@/hooks/scheduling/use-employee-shifts';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardStats } from './dashboard/DashboardStats';
import { EmployeeListCard } from './dashboard/EmployeeListCard';

export function AdminDashboard() {
  const { 
    employees, 
    activeShifts, 
    activeBreaks, 
    loading,
    refreshData
  } = useEmployeeShifts();
  
  // Count employees by status
  const totalOnShift = activeShifts.length;
  const totalOnBreak = activeBreaks.length;
  const totalActive = totalOnShift - totalOnBreak;
  
  return (
    <div className="space-y-6">
      <DashboardHeader refreshData={refreshData} />
      
      {/* Stats section */}
      <DashboardStats 
        totalActive={totalActive}
        totalOnBreak={totalOnBreak}
        totalOnShift={totalOnShift}
      />
      
      {/* Employee list */}
      <EmployeeListCard 
        employees={employees}
        activeBreaks={activeBreaks}
        loading={loading}
      />
    </div>
  );
}
