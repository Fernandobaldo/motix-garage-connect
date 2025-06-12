
import { useMemo } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { hasAccess, getPlanLimits, type FeatureType, type PlanType } from '@/utils/permissions';

export const usePermissions = () => {
  const { tenant } = useTenant();
  
  const plan = (tenant?.subscription_plan as PlanType) || 'free';
  
  const permissions = useMemo(() => ({
    plan,
    hasAccess: (feature: FeatureType) => hasAccess(plan, feature),
    limits: getPlanLimits(plan),
    canAccessChat: hasAccess(plan, 'chat'),
    canAccessSMS: hasAccess(plan, 'sms'),
    canUploadFiles: hasAccess(plan, 'file_upload_chat'),
    canAccessInventory: hasAccess(plan, 'inventory'),
    canAccessAPI: hasAccess(plan, 'api_access'),
    canAccessMultipleWorkshops: hasAccess(plan, 'multiple_workshops'),
    canAccessAdvancedAnalytics: hasAccess(plan, 'advanced_analytics'),
    canAccessCustomBranding: hasAccess(plan, 'custom_branding'),
  }), [plan]);

  return permissions;
};

export default usePermissions;
