
import { IncidentStatus } from '@/types';
import { Badge } from '@/components/ui/badge';

interface IncidentStatusBadgeProps {
  status: IncidentStatus;
}

const IncidentStatusBadge = ({ status }: IncidentStatusBadgeProps) => {
  const getStatusClass = (status: IncidentStatus) => {
    switch (status) {
      case 'active':
        return 'bg-status-responding text-white';
      case 'pending':
        return 'bg-status-busy text-white';
      case 'resolved':
        return 'bg-status-available text-white';
      case 'archived':
        return 'bg-status-offDuty text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Badge className={`${getStatusClass(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default IncidentStatusBadge;
