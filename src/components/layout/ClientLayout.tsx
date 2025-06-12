
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ClientHeader from './ClientHeader';
import ClientSidebar from './ClientSidebar';

interface ClientLayoutProps {
  children: ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your information.</p>
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
