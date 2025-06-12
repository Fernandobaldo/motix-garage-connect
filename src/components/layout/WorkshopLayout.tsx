
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AppHeader from './AppHeader';

interface WorkshopLayoutProps {
  children: ReactNode;
}

const WorkshopLayout = ({ children }: WorkshopLayoutProps) => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we load your information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default WorkshopLayout;
