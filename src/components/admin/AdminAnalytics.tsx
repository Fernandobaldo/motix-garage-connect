
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Activity, Users, Building2, TrendingUp } from 'lucide-react';

const AdminAnalytics = () => {
  // Fetch system analytics
  const { data: systemStats, isLoading } = useQuery({
    queryKey: ['system-analytics'],
    queryFn: async () => {
      // Get total workshops
      const { data: workshops, error: workshopsError } = await supabase
        .from('tenants')
        .select('id, subscription_plan, status, created_at')
        .order('created_at', { ascending: false });

      if (workshopsError) throw workshopsError;

      // Get total users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, role, created_at');

      if (usersError) throw usersError;

      // Get total appointments across all tenants
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, created_at, status');

      if (appointmentsError) throw appointmentsError;

      return {
        workshops: workshops || [],
        users: users || [],
        appointments: appointments || [],
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!systemStats) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const totalWorkshops = systemStats.workshops.length;
  const activeWorkshops = systemStats.workshops.filter(w => w.status === 'active').length;
  const totalUsers = systemStats.users.length;
  const totalAppointments = systemStats.appointments.length;

  // Plan distribution
  const planDistribution = systemStats.workshops.reduce((acc, workshop) => {
    acc[workshop.subscription_plan] = (acc[workshop.subscription_plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const planChartData = Object.entries(planDistribution).map(([plan, count]) => ({
    name: plan.toUpperCase(),
    value: count,
    percentage: ((count / totalWorkshops) * 100).toFixed(1),
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Monthly growth data (simplified)
  const monthlyData = [
    { month: 'Jan', workshops: 12, users: 45 },
    { month: 'Feb', workshops: 19, users: 67 },
    { month: 'Mar', workshops: 25, users: 89 },
    { month: 'Apr', workshops: 32, users: 112 },
    { month: 'May', workshops: 38, users: 134 },
    { month: 'Jun', workshops: totalWorkshops, users: totalUsers },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workshops</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkshops}</div>
            <p className="text-xs text-muted-foreground">
              {activeWorkshops} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All roles combined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              System-wide
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalWorkshops > 0 ? ((activeWorkshops / totalWorkshops) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Workshop activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan Distribution</CardTitle>
            <CardDescription>
              Breakdown of workshops by subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>
              Monthly growth in workshops and users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="workshops" stroke="#8884d8" name="Workshops" />
                <Line type="monotone" dataKey="users" stroke="#82ca9d" name="Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
