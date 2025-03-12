
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
      // Special admin check
      if (email === 'admin@calexico.ca.gov' || email === 'avalladolid@calexico.ca.gov') {
        console.log("Attempting admin login for:", email);
        
        // Try to sign in first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.log("Admin sign-in failed, creating admin account:", signInError.message);
          
          // Create admin account if login fails
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
            toast({
              title: "Admin Creation Error",
              description: signUpError.message || "Failed to create admin account",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
          
          if (signUpData?.user) {
            console.log("Admin user created, setting role:", signUpData.user.id);
            
            // Set the role explicitly to admin in the profiles table
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', signUpData.user.id);
            
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
            
            // Now attempt to sign in with the newly created account
            const { error: newSignInError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (newSignInError) {
              toast({
                title: "Login Failed",
                description: "Created admin account but couldn't sign in. Please try again.",
                variant: "destructive"
              });
              setLoading(false);
              return;
            }
            
            toast({
              title: "Admin Account Created",
              description: "Administrator account has been created and you're now signed in.",
            });
            navigate('/');
            setLoading(false);
            return;
          }
        } else if (signInData?.user) {
          console.log("Admin signed in successfully:", signInData.user.id);
          
          // Check if admin role is set
          const { data: existingProfile, error: profileFetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signInData.user.id)
            .single();
          
          if (profileFetchError) {
            console.error("Error fetching profile:", profileFetchError);
          } else if (existingProfile && existingProfile.role !== 'admin') {
            console.log("Updating role to admin for existing user");
            
            // Update to admin role if not already
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', signInData.user.id);
            
            if (updateError) {
              console.error("Error updating to admin role:", updateError);
            }
          }
          
          toast({
            title: "Login successful",
            description: "Welcome back, Administrator!",
          });
          navigate('/');
          setLoading(false);
          return;
        }
      }

      // Regular login attempt for non-admin users
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
