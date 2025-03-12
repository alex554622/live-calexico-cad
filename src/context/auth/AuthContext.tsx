
import React, { createContext, useContext } from 'react';
import { AuthContextType, Permission } from './types';
import { useAuthProvider } from './useAuthProvider';
import { checkPermission } from './permissions';

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component for authentication context
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();
  
  const hasPermission = (permission: Permission) => {
    return checkPermission(auth.user, permission);
  };

  // Combine all auth functionality for the context value
  const contextValue: AuthContextType = {
    ...auth,
    hasPermission
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access the authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
