
import React from 'react';
import { Officer } from '@/types';
import OfficerStatusBadge from '@/components/common/OfficerStatusBadge';

interface OfficerInfoProps {
  officer: Officer;
}

const OfficerInfo: React.FC<OfficerInfoProps> = ({ officer }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{officer.name}</div>
        <div className="text-xs text-muted-foreground">{officer.badgeNumber}</div>
      </div>
      <OfficerStatusBadge status={officer.status} />
    </div>
  );
};

export default OfficerInfo;
