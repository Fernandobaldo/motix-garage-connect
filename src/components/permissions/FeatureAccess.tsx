
import React, { useState } from 'react';
import { hasAccess, getUpgradeMessage, type FeatureType, type PlanType } from '@/utils/permissions';
import { useTenant } from '@/hooks/useTenant';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UpgradeModal } from './UpgradeModal';

interface FeatureAccessProps {
  feature: FeatureType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  userPlan?: PlanType;
  showUpgradeModal?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FeatureAccess: React.FC<FeatureAccessProps> = ({ 
  feature, 
  children, 
  fallback,
  userPlan,
  showUpgradeModal = true,
  disabled = false,
  className = ""
}) => {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const plan = userPlan || (tenant?.subscription_plan as PlanType) || 'free';
  const hasFeatureAccess = hasAccess(plan, feature);

  const handleUpgradeClick = () => {
    // Track analytics event
    console.log('Feature locked attempt:', { feature, plan, timestamp: new Date().toISOString() });
    
    if (showUpgradeModal) {
      setIsUpgradeModalOpen(true);
    } else {
      toast({
        title: "Upgrade Required",
        description: getUpgradeMessage(feature),
        variant: "default",
      });
    }
  };

  // If feature is accessible and not disabled, show children
  if (hasFeatureAccess && !disabled) {
    return <div className={className}>{children}</div>;
  }

  // If feature is accessible but disabled (e.g., usage limits), show with warning
  if (hasFeatureAccess && disabled) {
    return (
      <div className={`relative ${className}`}>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded">
          <div className="text-center p-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-800">Usage Limit Reached</p>
            <p className="text-xs text-gray-600">Upgrade to continue using this feature</p>
          </div>
        </div>
      </div>
    );
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // Default upgrade prompt
  return (
    <>
      <Card className={`border-dashed border-2 border-gray-300 ${className}`}>
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

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlan={plan}
        requiredFeature={feature}
      />
    </>
  );
};

export default FeatureAccess;
