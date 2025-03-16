
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Dashboard from './Dashboard';

/**
 * Index page that serves as the entry point of the application
 * Renders the Dashboard component or redirects to login if not authenticated
 */
const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is not authenticated and we're not still loading, redirect to login
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // While loading, show a simple loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the Dashboard component
  if (user) {
    return <Dashboard />;
  }

  // This should not be visible as the useEffect should redirect,
  // but we include it as a fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Calexico Police CAD</h1>
        <p className="text-xl text-muted-foreground">Please log in to access the system.</p>
      </div>
    </div>
  );
};

export default Index;
