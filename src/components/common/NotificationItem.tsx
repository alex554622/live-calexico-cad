
import React from 'react';
import { format } from 'date-fns';
import { Notification } from '@/types';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info,
} from 'lucide-react';
import { useData } from '@/context/DataContext';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const { markNotificationAsRead } = useData();
  
  const handleClick = () => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    if (onClick) onClick();
  };
  
  const getIcon = () => {
    switch (notification.type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-status-busy" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-status-available" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-status-responding" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-police-light" />;
    }
  };
  
  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };
  
  return (
    <div 
      className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors
        ${notification.read ? 'opacity-70' : 'bg-blue-50'}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <span className="text-xs text-gray-500">{formatTime(notification.timestamp)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
