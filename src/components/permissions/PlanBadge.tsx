
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { type PlanType } from '@/utils/permissions';
import { Crown, Zap, Star, Gem } from 'lucide-react';

interface PlanBadgeProps {
  plan: PlanType;
  className?: string;
}

const planConfig = {
  free: {
    label: 'Free',
    variant: 'secondary' as const,
    icon: Star,
    color: 'text-gray-600',
  },
  starter: {
    label: 'Starter',
    variant: 'default' as const,
    icon: Zap,
    color: 'text-blue-600',
  },
  pro: {
    label: 'Pro',
    variant: 'default' as const,
    icon: Crown,
    color: 'text-purple-600',
  },
  enterprise: {
    label: 'Enterprise',
    variant: 'default' as const,
    icon: Gem,
    color: 'text-gold-600',
  },
};

export const PlanBadge: React.FC<PlanBadgeProps> = ({ plan, className = '' }) => {
  const config = planConfig[plan];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${className}`}>
      <Icon className={`h-3 w-3 ${config.color}`} />
      {config.label}
    </Badge>
  );
};

export default PlanBadge;
