
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { EmployeeBreak } from '@/types/scheduling';

interface EmployeeStatusBadgeProps {
  isOnBreak: boolean;
  breakType?: string;
  elapsedMinutes?: number;
}

export function EmployeeStatusBadge({ 
  isOnBreak, 
  breakType,
  elapsedMinutes 
}: EmployeeStatusBadgeProps) {
  const getBreakTypeLabel = (breakType: string) => {
    switch (breakType) {
      case 'paid10': return '10-min Paid';
      case 'unpaid30': return '30-min Lunch';
      case 'unpaid60': return '1-hour Lunch';
      default: return breakType;
    }
  };

  if (isOnBreak) {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        {getBreakTypeLabel(breakType || '')} Break ({elapsedMinutes}m)
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
      Active
    </Badge>
  );
}
