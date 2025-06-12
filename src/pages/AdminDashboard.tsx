
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, Building2, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import WorkshopManagementTable from '@/components/admin/WorkshopManagementTable';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminDashboard = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect non-superadmin users
  if (!profile || profile.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">System administration and workshop management</p>
        </div>
      </div>

      <Tabs defaultValue="workshops" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workshops" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Workshop Management</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>System Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workshops" className="space-y-4">
          <WorkshopManagementTable />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdminAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
