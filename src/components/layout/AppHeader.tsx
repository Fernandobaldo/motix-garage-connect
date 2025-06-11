
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/notifications/NotificationBell";

const AppHeader = () => {
  const { signOut, profile } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold text-gray-900">
            Garage Management
          </h1>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <span className="text-sm text-gray-600">
              Welcome back, {profile?.full_name || 'User'}!
            </span>
            <Button onClick={signOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
