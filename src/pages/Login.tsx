
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    console.log('Login function called directly');
    
    if (!email || !password) {
      console.log('Missing email or password');
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if data retention was previously enabled
      const retentionEnabled = localStorage.getItem('dataRetention') === 'true';
      
      console.log('Attempting login with email:', email);
      
      // When logging in, pass the retention status
      const success = await login(email, password, retentionEnabled);
      
      if (success) {
        console.log('Login successful, redirecting to dashboard');
        navigate('/');
      } else {
        console.error('Login failed');
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <Button
              className="w-full mt-6 bg-police hover:bg-police-dark"
              onClick={handleLogin}
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Log in with your authorized account credentials
            </p>
          </CardFooter>
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
