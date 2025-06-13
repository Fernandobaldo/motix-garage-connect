
import { useAuth } from '@/hooks/useAuth';
import RoleGuard from '@/components/auth/RoleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, BarChart3, Settings } from 'lucide-react';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import EnhancedWorkshopManagementTable from '@/components/admin/EnhancedWorkshopManagementTable';

const AdminDashboard = () => {
  const { profile } = useAuth();

  return (
    <RoleGuard allowedRoles={['admin', 'superadmin']}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">
              {profile?.role === 'superadmin' ? 'SuperAdmin' : 'Admin'} Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage workshops and monitor system performance
            </p>
          </div>
        </div>

        <Tabs defaultValue="workshops" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workshops" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Workshop Management</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workshops" className="space-y-4">
            {profile?.role === 'superadmin' ? (
              <EnhancedWorkshopManagementTable />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Workshop Management</CardTitle>
                  <CardDescription>
                    This feature is only available to SuperAdmin users.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Contact your SuperAdmin to access workshop management features.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Settings panel coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
};

export default AdminDashboard;
