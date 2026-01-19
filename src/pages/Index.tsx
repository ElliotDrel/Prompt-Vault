import { useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { AppLayout } from '@/components/AppLayout';

const Index = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Dashboard - Prompt Vault';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
};

export default Index;
