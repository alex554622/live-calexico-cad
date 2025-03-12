
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
      // Admin credentials check for username "avalla"
      if (email === 'avalla' && password === '1992') {
        // Use a fixed email for the actual Supabase auth
        const adminEmail = 'avalladolid@calexico.ca.gov';
        
        // First check if the account exists
        const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: "1992"
        });

        if (signInError) {
          console.log("Admin account doesn't exist yet, creating it");
          
          // Create admin user if it doesn't exist
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
            console.error("Admin creation error:", signUpError);
            toast({
              title: "Admin Creation Error",
              description: signUpError.message || "Failed to create admin account",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
          
          // Check if profile exists and update it
          if (authData?.user) {
            // Wait a moment for the profile to be created by the trigger
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update the profile to admin role
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
            }
          }
          
          // Now login with the created account
          const success = await login(adminEmail, "1992", false);
          if (success) {
            toast({
              title: "Admin Login Successful",
              description: "Welcome, Administrator!",
            });
            navigate('/');
          } else {
            toast({
              title: "Admin Login Failed",
              description: "Created admin account but failed to authenticate. Please try again.",
              variant: "destructive"
            });
          }
        } else {
          // Account exists, just need to verify/update role
          if (session?.user) {
            // Check if admin profile exists and has admin role
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (existingProfile && existingProfile.role !== 'admin') {
              // Update existing profile to admin if not already
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', session.user.id);
                
              if (updateError) {
                console.error("Error updating to admin role:", updateError);
              }
            }
            
            // User is already signed in through Supabase auth.signInWithPassword
            toast({
              title: "Admin Login Successful",
              description: "Welcome, Administrator!",
            });
            navigate('/');
          }
        }
      } else {
        // Regular login attempt
        const success = await login(email, password, false);
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
