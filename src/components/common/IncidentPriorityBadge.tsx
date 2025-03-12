
import { IncidentPriority } from '@/types';
import { Badge } from '@/components/ui/badge';

interface IncidentPriorityBadgeProps {
  priority: IncidentPriority;
}

const IncidentPriorityBadge = ({ priority }: IncidentPriorityBadgeProps) => {
  const getPriorityClass = (priority: IncidentPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-status-responding text-white';
      case 'medium':
        return 'bg-status-busy text-white';
      case 'low':
        return 'bg-status-available text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Badge className={`${getPriorityClass(priority)}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

export default IncidentPriorityBadge;
