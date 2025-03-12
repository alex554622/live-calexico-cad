
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Shield, Database } from 'lucide-react';

const SystemSettings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [dataRetention, setDataRetention] = useState(localStorage.getItem('dataRetention') || "5");

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been saved successfully',
      });
      
      localStorage.setItem('dataRetention', dataRetention);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          System Settings
        </CardTitle>
        <CardDescription>
          Configure system-wide settings (admin only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="systemName">System Name</Label>
          <Input id="systemName" defaultValue="Calexico Police CAD" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dataRetention">Data Retention (days)</Label>
          <Input 
            id="dataRetention" 
            type="number" 
            min="1" 
            max="30"
            value={dataRetention}
            onChange={(e) => setDataRetention(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            How long to keep incident data before automatic deletion (1-30 days, default: 5)
          </p>
        </div>

        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Incidents older than the data retention period will be automatically deleted.
              Make sure to download important data before it expires.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Auto-Delete Old Incidents</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically delete incidents after retention period
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Separator />
        
        <div className="space-y-4">
          <Label>System Features</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Enable Real-time Updates</p>
              <p className="text-sm text-muted-foreground">
                Automatically push updates to all clients
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Advanced Reporting</p>
              <p className="text-sm text-muted-foreground">
                Enable advanced reporting and analytics features
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save System Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SystemSettings;
