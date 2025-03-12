
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

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if data retention was previously enabled
    const retentionEnabled = localStorage.getItem('dataRetention') === 'true';
    
    // When logging in, pass the retention status
    const success = await login(username, password, retentionEnabled);
    if (success) {
      navigate('/');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
    </div>
  );
};

export default Login;
