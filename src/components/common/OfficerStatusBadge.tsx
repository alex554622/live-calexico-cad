
import { OfficerStatus } from '@/types';

interface OfficerStatusBadgeProps {
  status: OfficerStatus;
  showText?: boolean;
}

const OfficerStatusBadge = ({ status, showText = true }: OfficerStatusBadgeProps) => {
  const getStatusClass = (status: OfficerStatus) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'busy':
        return 'status-busy';
      case 'responding':
        return 'status-responding';
      case 'offDuty':
        return 'status-offDuty';
      default:
        return 'status-offDuty';
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
    <div className="flex items-center">
      <span className={`status-indicator ${getStatusClass(status)}`}></span>
      {showText && <span className="text-sm font-medium">{getStatusText(status)}</span>}
    </div>
  );
};

export default OfficerStatusBadge;
