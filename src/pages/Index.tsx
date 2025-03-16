
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Index page that serves as the entry point of the application
 * Redirects to Dashboard if authenticated or Login if not
 */
const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // If user is authenticated, redirect to dashboard
      if (user) {
        navigate('/dashboard');
      } else {
        // If not authenticated, redirect to login
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  // Show a loading spinner while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {loading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xl text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <p className="text-xl text-muted-foreground">Redirecting...</p>
        )}
      </div>
    </div>
  );
};

export default Index;
