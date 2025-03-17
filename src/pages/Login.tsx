
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
import { useIsMobile } from '@/hooks/use-mobile';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Attempting login with:", { email });
      
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
          variant: "default"
        });
        
        navigate('/');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gray-100">
      <div className={`w-full ${isMobile ? 'max-w-xs' : 'max-w-sm'} p-2`}>
        <Card className="border-2 border-police shadow-md">
          <CardHeader className="space-y-1 flex flex-col items-center pb-4">
            <div className="w-10 h-10 bg-police rounded-full flex items-center justify-center mb-2">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-center">Calexico Live</CardTitle>
            <CardDescription className="text-center text-sm">
              Real-Time Officer Activity Display
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-9"
                />
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                className="w-full bg-police hover:bg-police-dark h-9 text-sm"
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
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center">
          <div className="bg-white p-2 rounded-md shadow-sm">
            <p className="text-xs text-gray-500">by</p>
            <p className="text-sm font-semibold text-police">Valladolid Software Engineering</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
