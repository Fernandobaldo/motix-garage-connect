
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
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

const Index = () => {
  const { user, profile, loading, profileError, signOut } = useAuth();
  const { activeTab, setActiveTab, selectedAppointmentId, handleCardClick } = useDashboardNavigation();

  console.log('Index page render - User:', user?.id, 'Profile:', profile?.id, 'Loading:', loading, 'Error:', profileError);

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

  if (profileError) {
    console.log('Profile error:', profileError);
    
    // Check if it's an invalid session error
    const isSessionError = profileError.includes('Invalid user session') || 
                          profileError.includes('corrupted') ||
                          profileError.includes('sign in again');
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <div className="mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              {isSessionError ? 'Session Error' : 'Profile Load Error'}
            </h2>
          </div>
          
          <p className="text-muted-foreground mb-6">
            {isSessionError 
              ? 'Your session appears to be corrupted. Please sign in again to continue.'
              : `There was an issue loading your account information: ${profileError}`
            }
          </p>
          
          {user?.id && (
            <p className="text-xs text-gray-400 mb-4 font-mono bg-gray-100 p-2 rounded">
              User ID: {user.id}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {isSessionError ? (
              <Button 
                onClick={() => signOut().then(() => window.location.href = '/auth')}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Sign In Again</span>
              </Button>
            ) : (
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    console.log('User exists but no profile, showing profile loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 text-orange-600">
          <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Your user account exists but no profile was found. This might be a setup issue.
          </p>
          <p className="text-xs text-gray-400 mb-4 font-mono bg-gray-100 p-2 rounded">
            User ID: {user.id}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>
              Retry Loading
            </Button>
            <Button 
              variant="outline" 
              onClick={() => signOut().then(() => window.location.href = '/auth')}
            >
              Sign Out
            </Button>
          </div>
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
