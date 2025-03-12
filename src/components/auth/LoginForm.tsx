
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

  const isAdminEmail = (email: string) => {
    return email === 'avalladolid@calexico.ca.gov' || email === 'admin@calexico.ca.gov';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Special case for administrator login with hardcoded credentials
      if (isAdminEmail(email) && password === '1992') {
        console.log("Admin login attempt with email:", email);
        
        // Try to sign in first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError && signInError.message.includes('Invalid login credentials')) {
          console.log("Admin user doesn't exist yet, creating account");
          
          // If login fails, try to create the admin user
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: 'Administrator'
              }
            }
          });
          
          if (signUpError) {
            console.error("Admin creation error:", signUpError);
            throw signUpError;
          }
          
          // User was created, now try to login
          console.log("Admin user created, attempting login");
          const retentionEnabled = localStorage.getItem('dataRetention') === 'true';
          const success = await login(email, password, retentionEnabled);
          
          if (success) {
            toast({
              title: "Admin Login Successful",
              description: "Welcome, Administrator!",
            });
            navigate('/');
          } else {
            throw new Error("Failed to log in as admin after creating account");
          }
        } else if (signInData) {
          // Login successful, make sure retention status is passed
          console.log("Admin user exists, login successful");
          const retentionEnabled = localStorage.getItem('dataRetention') === 'true';
          await login(email, password, retentionEnabled);
          
          toast({
            title: "Admin Login Successful",
            description: "Welcome back, Administrator!",
          });
          navigate('/');
        }
      } else {
        // Regular login flow
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
