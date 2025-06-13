
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import AppHeader from './AppHeader';

interface WorkshopLayoutProps {
  children: ReactNode;
}

const WorkshopLayout = ({ children }: WorkshopLayoutProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we load your information.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    console.error('WorkshopLayout: Profile failed to load');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 text-red-600">
          <h2 className="text-xl font-semibold mb-4">Failed to load your profile</h2>
          <p className="text-muted-foreground mb-4">
            There was an issue loading your workshop information. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
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
