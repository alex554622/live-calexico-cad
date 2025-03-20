
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface DashboardHeaderProps {
  refreshData: () => void;
}

export function DashboardHeader({ refreshData }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Employee Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor active employees and their current status
        </p>
      </div>
      
      <Button 
        variant="outline" 
        onClick={refreshData}
        className="gap-2"
      >
        <Clock className="h-4 w-4" />
        Refresh Data
      </Button>
    </div>
  );
}
