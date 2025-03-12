
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
      // Admin credentials check
      if (email === 'avalla' && password === '1992') {
        const adminEmail = 'avalladolid@calexico.ca.gov';
        
        // Try to login with admin account first
        const success = await login(adminEmail, "1992", false);
        
        if (!success) {
          // If login failed, try to create admin account
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: "1992",
            options: {
              data: {
                name: 'Administrator'
              }
            }
          });

          if (signUpError) {
            toast({
              title: "Admin Creation Error",
              description: signUpError.message || "Failed to create admin account",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }

          if (authData?.user) {
            // Wait for profile creation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Set admin role
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', authData.user.id);

            if (profileError) {
              console.error("Error setting admin role:", profileError);
              toast({
                title: "Admin Role Error",
                description: "Failed to set admin privileges",
                variant: "destructive"
              });
              setLoading(false);
              return;
            }

            // Try login again after account creation
            const loginSuccess = await login(adminEmail, "1992", false);
            if (loginSuccess) {
              toast({
                title: "Admin Login Successful",
                description: "Welcome, Administrator!",
              });
              navigate('/');
            } else {
              toast({
                title: "Admin Login Failed",
                description: "Created admin account but failed to login",
                variant: "destructive"
              });
            }
          }
        } else {
          // Successful admin login
          toast({
            title: "Admin Login Successful",
            description: "Welcome, Administrator!",
          });
          navigate('/');
        }
      } else {
        // Regular user login
        const success = await login(email, password, false);
        if (success) {
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          navigate('/');
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid email or password",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
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
          <Label htmlFor="email">Username or Email</Label>
          <Input
            id="email"
            type="text"
            placeholder="Enter your username or email"
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
