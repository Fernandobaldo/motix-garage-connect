
import { useAuth } from "@/hooks/useAuth";
import { Tabs } from "@/components/ui/tabs";
import TenantStats from "@/components/dashboard/TenantStats";
import LandingPage from "@/components/landing/LandingPage";
import AppHeader from "@/components/layout/AppHeader";
import DashboardTabs from "@/components/layout/DashboardTabs";
import DashboardContent from "@/components/layout/DashboardContent";
import { useDashboardNavigation } from "@/hooks/useDashboardNavigation";

const Index = () => {
  const { user, profile } = useAuth();
  const { activeTab, setActiveTab, selectedAppointmentId, handleCardClick } = useDashboardNavigation();

  if (!user) {
    return <LandingPage />;
  }

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

  const userRole = profile.role as 'client' | 'workshop';

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>
    </div>
  );
};

export default Index;
