import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { StatsCounter } from './StatsCounter';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <StatsCounter />
        </div>
      </div>
      {children}
    </div>
  );
}
