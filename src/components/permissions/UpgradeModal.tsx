
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Zap, Crown } from 'lucide-react';
import type { FeatureType, PlanType } from '@/utils/permissions';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanType;
  requiredFeature?: FeatureType;
}

const planDetails = {
  free: {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    icon: Zap,
    color: 'text-gray-600',
    features: [
      '20 appointments/month',
      '5 vehicles',
      '100MB storage',
      'Basic support'
    ]
  },
  starter: {
    name: 'Starter',
    price: '$29',
    description: 'Great for small workshops',
    icon: Zap,
    color: 'text-blue-600',
    features: [
      '50 appointments/month',
      '10 vehicles',
      '1GB storage',
      'Real-time chat',
      'File uploads',
      'SMS notifications',
      'Basic branding (logo + colors)',
      'Priority support'
    ]
  },
  pro: {
    name: 'Pro',
    price: '$99',
    description: 'Perfect for growing businesses',
    icon: Crown,
    color: 'text-purple-600',
    features: [
      '200 appointments/month',
      '50 vehicles',
      '10GB storage',
      'Everything in Starter',
      'Inventory management',
      'Multi-workshop support',
      'Full custom branding',
      'Advanced analytics'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    icon: Crown,
    color: 'text-gold-600',
    features: [
      'Unlimited appointments',
      'Unlimited vehicles',
      'Unlimited storage',
      'Everything in Pro',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee'
    ]
  }
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  requiredFeature
}) => {
  const handleUpgrade = (plan: PlanType) => {
    // TODO: Implement actual upgrade logic
    console.log('Upgrading to plan:', plan);
    // This would typically integrate with a payment processor
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {requiredFeature ? 'Upgrade Required' : 'Choose Your Plan'}
          </DialogTitle>
          {requiredFeature && (
            <p className="text-center text-gray-600 mt-2">
              This feature requires a higher subscription plan
            </p>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {(Object.keys(planDetails) as PlanType[]).map((plan) => {
            const details = planDetails[plan];
            const Icon = details.icon;
            const isCurrentPlan = plan === currentPlan;
            const isUpgrade = ['starter', 'pro', 'enterprise'].indexOf(plan) > 
                             ['free', 'starter', 'pro', 'enterprise'].indexOf(currentPlan);

            return (
              <Card 
                key={plan} 
                className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''} 
                           ${plan === 'pro' ? 'border-purple-200 bg-purple-50' : ''}`}
              >
                {plan === 'pro' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${details.color} bg-gray-100`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{details.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {details.price}
                    {plan !== 'free' && plan !== 'enterprise' && (
                      <span className="text-sm font-normal text-gray-500">/month</span>
                    )}
                  </div>
                  <CardDescription>{details.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {details.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}

                  <div className="pt-4">
                    {isCurrentPlan ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : isUpgrade ? (
                      <Button 
                        onClick={() => handleUpgrade(plan)}
                        className={`w-full ${plan === 'pro' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                      >
                        Upgrade to {details.name}
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full">
                        Downgrade
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>All plans include 14-day free trial • Cancel anytime • No setup fees</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
