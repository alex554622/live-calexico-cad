
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search, Trash2 } from 'lucide-react';
import NotificationItem from '@/components/common/NotificationItem';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Notifications = () => {
  const { notifications, loadingNotifications, markNotificationAsRead, deleteReadNotifications } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { toast } = useToast();

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesUnread = !showUnreadOnly || !notification.read;
    
    return matchesSearch && matchesType && matchesUnread;
  });

  const markAllAsRead = () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    unreadNotifications.forEach(notification => {
      markNotificationAsRead(notification.id);
    });
  };

  const handleDeleteReadNotifications = async () => {
    try {
      const readCount = notifications.filter(n => n.read).length;
      
      if (readCount === 0) {
        toast({
          title: "No read notifications",
          description: "There are no read notifications to delete.",
          variant: "default",
        });
        return;
      }
      
      const deletedCount = await deleteReadNotifications();
      
      toast({
        title: "Notifications deleted",
        description: `${deletedCount} read notifications have been deleted.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast({
        title: "Error",
        description: "Failed to delete read notifications.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          View and manage all system notifications.
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-[130px]">
              <Bell className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={showUnreadOnly ? "bg-blue-50" : ""}
          >
            {showUnreadOnly ? "Unread Only" : "All Notifications"}
          </Button>
          
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All Read
          </Button>
          
          <Button variant="outline" onClick={handleDeleteReadNotifications} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Read
          </Button>
        </div>
      </div>

      {loadingNotifications ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <p>Loading notifications...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-2" />
              <p>No notifications found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="divide-y border rounded-md shadow-sm">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
