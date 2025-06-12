
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, Car, HardDrive, Zap } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { formatStorageSize } from '@/utils/permissions';

export const UsageDashboard: React.FC = () => {
  const permissions = usePermissions();
  const { plan, limits, usage, appointmentUsagePercentage, storageUsagePercentage } = permissions;

  const usageItems = [
    {
      title: 'Appointments This Month',
      icon: Calendar,
      current: usage.appointments_used,
      limit: limits.appointments,
      percentage: appointmentUsagePercentage,
      color: appointmentUsagePercentage >= 80 ? 'text-red-500' : 
             appointmentUsagePercentage >= 60 ? 'text-yellow-500' : 'text-green-500'
    },
    {
      title: 'Storage Used',
      icon: HardDrive,
      current: formatStorageSize(usage.storage_used),
      limit: limits.storage,
      percentage: storageUsagePercentage,
      color: storageUsagePercentage >= 80 ? 'text-red-500' : 
             storageUsagePercentage >= 60 ? 'text-yellow-500' : 'text-green-500'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Usage & Limits</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Current Plan:</span>
          <span className="font-medium capitalize">{plan}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {usageItems.map((item, index) => {
          const Icon = item.icon;
          const isUnlimited = item.limit === -1 || item.limit === 'unlimited';
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {item.current}
                  {!isUnlimited && (
                    <span className="text-sm font-normal text-gray-500">
                      {' '}/ {item.limit}
                    </span>
                  )}
                </div>
                {!isUnlimited && (
                  <>
                    <Progress 
                      value={item.percentage} 
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {item.percentage.toFixed(1)}% used
                    </p>
                  </>
                )}
                {isUnlimited && (
                  <p className="text-xs text-green-600 mt-1">
                    Unlimited
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(permissions.isNearAppointmentLimit || permissions.isNearStorageLimit) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Approaching Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-3">
              You're approaching your plan limits. Consider upgrading to avoid service interruption.
            </p>
            <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsageDashboard;
