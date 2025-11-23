import { createContext, useContext } from 'react';

// Create the context
export const DataContext = createContext();

// Custom hook to use the context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

