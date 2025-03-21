
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/data"; // Updated import path
import { ThemeProvider } from "./context/ThemeContext";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Officers from "./pages/Officers";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import EmployeeScheduling from "./pages/EmployeeScheduling";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Settings route component that requires viewSettings permission
const SettingsRoute = () => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission('viewSettings')) {
    return <Navigate to="/" replace />;
  }
  
  return <Settings />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/officers" element={<Officers />} />
                        <Route path="/incidents" element={<Incidents />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/scheduling" element={<EmployeeScheduling />} />
                        <Route path="/settings" element={<SettingsRoute />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                } />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
