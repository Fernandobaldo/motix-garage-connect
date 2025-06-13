
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import ClientHeader from './ClientHeader';
import ClientSidebar from './ClientSidebar';

interface ClientLayoutProps {
  children: ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your information.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    console.error('ClientLayout: Profile failed to load');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 text-red-600">
          <h2 className="text-xl font-semibold mb-4">Failed to load your profile</h2>
          <p className="text-muted-foreground mb-4">
            There was an issue loading your account information. Please try again.
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
      <ClientHeader />
      <div className="flex">
        <ClientSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
