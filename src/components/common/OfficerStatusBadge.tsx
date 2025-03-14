
import { OfficerStatus } from '@/types';

interface OfficerStatusBadgeProps {
  status: OfficerStatus;
  showText?: boolean;
}

const OfficerStatusBadge = ({ status, showText = true }: OfficerStatusBadgeProps) => {
  const getStatusColorClass = (status: OfficerStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-orange-500';
      case 'responding':
        return 'bg-blue-500';
      case 'offDuty':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: OfficerStatus) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'responding':
        return 'Responding';
      case 'offDuty':
        return 'Off Duty';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${getStatusColorClass(status)}`}></span>
      {showText && <span className="text-sm font-medium">{getStatusText(status)}</span>}
    </div>
  );
};

export default OfficerStatusBadge;
