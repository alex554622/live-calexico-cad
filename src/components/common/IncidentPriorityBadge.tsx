
import { IncidentPriority } from '@/types';
import { Badge } from '@/components/ui/badge';

interface IncidentPriorityBadgeProps {
  priority: IncidentPriority;
}

const IncidentPriorityBadge = ({ priority }: IncidentPriorityBadgeProps) => {
  const getPriorityClass = (priority: IncidentPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
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
