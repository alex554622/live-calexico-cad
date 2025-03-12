import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if data retention was previously enabled
      const retentionEnabled = localStorage.getItem('dataRetention') === 'true';
      
      // Query the users table to find the matching user
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, 
          username, 
          name, 
          role, 
          avatar, 
          password,
          user_permissions(permission)
        `)
        .eq('username', username)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no data is found
      
      // Check if user exists and password matches
      if (error || !data || data.password !== password) {
        throw new Error('Invalid username or password');
      }
      
      // Store data retention preference
      localStorage.setItem('dataRetention', retentionEnabled ? 'true' : 'false');
      
      // Transform permissions from array of objects to object with boolean values
      const permissions: Record<string, boolean> = {};
      if (data.user_permissions) {
        data.user_permissions.forEach((p: { permission: string }) => {
          permissions[p.permission] = true;
        });
      }
      
      // Create session in localStorage
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          user: {
            id: data.id,
            email: data.username
          }
        }
      }));
      
      // Call the login function from AuthContext
      const success = await login(username, password, retentionEnabled);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.name}!`,
          variant: "default"
        });
        navigate('/');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid username or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Card className="border-2 border-police">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="w-12 h-12 bg-police rounded-full flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Calexico Live</CardTitle>
            <CardDescription className="text-center">
              Real-Time Officer Activity Display
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Default admin: alexvalla</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Default password: !345660312</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-police hover:bg-police-dark"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      {/* Valladolid Software Engineering Logo */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center">
          <div className="bg-white p-2 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">by</p>
            <p className="text-lg font-semibold text-police">Valladolid Software Engineering</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
