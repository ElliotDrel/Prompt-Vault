import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CopyEvent } from '../types/prompt';

interface CopyHistoryContextType {
  copyHistory: CopyEvent[];
  addCopyEvent: (event: Omit<CopyEvent, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  deleteCopyEvent: (id: string) => void;
}

const CopyHistoryContext = createContext<CopyHistoryContextType | undefined>(undefined);

export const useCopyHistory = () => {
  const context = useContext(CopyHistoryContext);
  if (context === undefined) {
    throw new Error('useCopyHistory must be used within a CopyHistoryProvider');
  }
  return context;
};

interface CopyHistoryProviderProps {
  children: ReactNode;
}

export const CopyHistoryProvider: React.FC<CopyHistoryProviderProps> = ({ children }) => {
  const [copyHistory, setCopyHistory] = useState<CopyEvent[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('copyHistory');
    if (storedHistory) {
      try {
        setCopyHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error('Error parsing copy history from localStorage:', error);
        localStorage.removeItem('copyHistory');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('copyHistory', JSON.stringify(copyHistory));
  }, [copyHistory]);

  const addCopyEvent = (event: Omit<CopyEvent, 'id' | 'timestamp'>) => {
    const newEvent: CopyEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    
    setCopyHistory(prev => [newEvent, ...prev]);
  };

  const clearHistory = () => {
    setCopyHistory([]);
    localStorage.removeItem('copyHistory');
  };

  const deleteCopyEvent = (id: string) => {
    setCopyHistory(prev => prev.filter(event => event.id !== id));
  };

  return (
    <CopyHistoryContext.Provider value={{
      copyHistory,
      addCopyEvent,
      clearHistory,
      deleteCopyEvent,
    }}>
      {children}
    </CopyHistoryContext.Provider>
  );
};