
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { Building, Users, Calendar, MessageSquare } from 'lucide-react';

interface TenantStatsProps {
  onCardClick?: (tab: string) => void;
}

const TenantStats = ({ onCardClick }: TenantStatsProps) => {
  const { tenant, loading } = useTenant();
  const { profile } = useAuth();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!tenant && profile?.role === 'workshop') {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No tenant information available. Please set up your garage.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {tenant && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
            <p className="text-gray-600">
              {profile?.role === 'workshop' ? 'Garage Dashboard' : 'Customer Dashboard'}
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Building className="h-3 w-3" />
            <span>{profile?.role === 'workshop' ? 'Garage' : 'Client'}</span>
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onCardClick?.('appointments')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onCardClick?.('messages')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 unread messages
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onCardClick?.('vehicles')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {profile?.role === 'workshop' ? 'Total Customers' : 'My Vehicles'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.role === 'workshop' ? '47' : '3'}</div>
            <p className="text-xs text-muted-foreground">
              {profile?.role === 'workshop' ? '+5 this month' : 'registered vehicles'}
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onCardClick?.('quotations')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantStats;
