
import React, { createContext, useContext } from 'react';
import { DataContextType } from './types';
import { useDataProvider } from './useDataProvider';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dataProviderValue = useDataProvider();

  return (
    <DataContext.Provider value={dataProviderValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
