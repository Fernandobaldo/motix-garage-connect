
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/components/landing/LandingPage";
import ClientLayout from "@/components/layout/ClientLayout";
import WorkshopLayout from "@/components/layout/WorkshopLayout";
import ClientDashboard from "@/components/client/ClientDashboard";
import TenantStats from "@/components/dashboard/TenantStats";
import { Tabs } from "@/components/ui/tabs";
import DashboardTabs from "@/components/layout/DashboardTabs";
import DashboardContent from "@/components/layout/DashboardContent";
import { useDashboardNavigation } from "@/hooks/useDashboardNavigation";

const Index = () => {
  const { user, profile, loading } = useAuth();
  const { activeTab, setActiveTab, selectedAppointmentId, handleCardClick } = useDashboardNavigation();

  console.log('Index page render - User:', user?.id, 'Profile:', profile?.id, 'Loading:', loading);

  if (loading) {
    console.log('Still loading, showing loading screen');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we load your information.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, showing landing page');
    return <LandingPage />;
  }

  if (!profile) {
    console.log('User exists but no profile, showing profile loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we load your information.</p>
          <p className="text-xs text-gray-400 mt-2">User ID: {user.id}</p>
        </div>
      </div>
    );
  }

  console.log('User and profile loaded, role:', profile.role);
  const userRole = profile.role as 'client' | 'workshop';

  // Client Experience - Simple dashboard
  if (userRole === 'client') {
    console.log('Rendering client layout');
    return (
      <ClientLayout>
        <ClientDashboard />
      </ClientLayout>
    );
  }

  // Workshop Experience - Full admin dashboard
  console.log('Rendering workshop layout');
  return (
    <WorkshopLayout>
      <div className="mb-6">
        <TenantStats onCardClick={handleCardClick} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <DashboardTabs userRole={userRole} />
        <DashboardContent 
          userRole={userRole} 
          selectedAppointmentId={selectedAppointmentId} 
        />
      </Tabs>
    </WorkshopLayout>
  );
};

export default Index;
