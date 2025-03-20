
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

type ClockEvent = {
  id: string;
  type: 'in' | 'out';
  timestamp: Date;
};

export const TimeClockCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockEvents, setClockEvents] = useState<ClockEvent[]>([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  
  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleClockIn = () => {
    const newEvent: ClockEvent = {
      id: crypto.randomUUID(),
      type: 'in',
      timestamp: new Date()
    };
    
    setClockEvents([...clockEvents, newEvent]);
    setIsClockedIn(true);
    
    toast({
      title: "Clocked In",
      description: `Successfully clocked in at ${format(new Date(), 'h:mm a')}`,
      variant: "default"
    });
  };
  
  const handleClockOut = () => {
    const newEvent: ClockEvent = {
      id: crypto.randomUUID(),
      type: 'out',
      timestamp: new Date()
    };
    
    setClockEvents([...clockEvents, newEvent]);
    setIsClockedIn(false);
    
    toast({
      title: "Clocked Out",
      description: `Successfully clocked out at ${format(new Date(), 'h:mm a')}`,
      variant: "default"
    });
  };
  
  // Recent clock events (last 5)
  const recentEvents = [...clockEvents]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Employee Time Clock</CardTitle>
        <CardDescription>Record your working hours</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-muted/50">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-medium text-lg">{user?.name}</h3>
            <p className="text-muted-foreground text-sm">{user?.role}</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">{format(currentTime, 'h:mm:ss')}</div>
            <div className="text-xs text-muted-foreground">{format(currentTime, 'a')}</div>
            <div className="text-sm mt-1">{format(currentTime, 'MMM d, yyyy')}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="w-full"
            disabled={isClockedIn}
            onClick={handleClockIn}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Clock In
          </Button>
          
          <Button 
            className="w-full" 
            variant="outline"
            disabled={!isClockedIn}
            onClick={handleClockOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Clock Out
          </Button>
        </div>
        
        {recentEvents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between text-sm p-2 border rounded">
                  <div className="flex items-center">
                    {event.type === 'in' ? (
                      <LogIn className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4 text-amber-500" />
                    )}
                    <span>{event.type === 'in' ? 'Clock In' : 'Clock Out'}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {format(event.timestamp, 'h:mm a')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        <Clock className="mr-1 h-3 w-3" />
        Your time records are automatically saved and processed weekly
      </CardFooter>
    </Card>
  );
};
