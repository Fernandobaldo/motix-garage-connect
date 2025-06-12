
import React from 'react';
import { hasAccess, getUpgradeMessage, type FeatureType, type PlanType } from '@/utils/permissions';
import { useTenant } from '@/hooks/useTenant';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeatureAccessProps {
  feature: FeatureType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  userPlan?: PlanType;
}

export const FeatureAccess: React.FC<FeatureAccessProps> = ({ 
  feature, 
  children, 
  fallback,
  userPlan 
}) => {
  const { tenant } = useTenant();
  const { toast } = useToast();
  
  const plan = userPlan || (tenant?.subscription_plan as PlanType) || 'free';
  const hasFeatureAccess = hasAccess(plan, feature);

  const handleUpgradeClick = () => {
    // Track analytics event
    console.log('Feature locked attempt:', { feature, plan, timestamp: new Date().toISOString() });
    
    toast({
      title: "Upgrade Required",
      description: getUpgradeMessage(feature),
      variant: "default",
    });
    
    // In a real app, this would open upgrade modal or redirect to billing
    // For now, we'll just show the toast
  };

  if (hasFeatureAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-gray-100 p-3 mb-4">
          <Lock className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Premium Feature
        </h3>
        <p className="text-gray-600 mb-4 max-w-sm">
          {getUpgradeMessage(feature)}
        </p>
        <Button onClick={handleUpgradeClick} className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureAccess;
