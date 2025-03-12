
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Special case for administrator login
      if (email === 'avalladolid@calexico.ca.gov' && password === '1992') {
        await handleAdminLogin();
      }
      
      // Check if data retention was previously enabled
      const retentionEnabled = localStorage.getItem('dataRetention') === 'true';
      
      // When logging in, pass the retention status
      const success = await login(email, password, retentionEnabled);
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate('/');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    // Try to create the admin user if it doesn't exist already
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', email)
      .single();
      
    if (checkError && !existingUser) {
      // Attempt to sign up the admin user
      const { data: authUser, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: 'Administrator'
          }
        }
      });
      
      if (signupError) {
        console.error("Admin creation error:", signupError);
      }
    }
  };

  return (
    <form onSubmit={handleLogin}>
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
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-police hover:bg-police/90"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </CardFooter>
    </form>
  );
};

export default LoginForm;
