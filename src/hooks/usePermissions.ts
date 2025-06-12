
import { useMemo } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { useMonthlyUsage } from '@/hooks/useMonthlyUsage';
import { 
  hasAccess, 
  getPlanLimits, 
  isWithinAppointmentLimit,
  isWithinStorageLimit,
  type FeatureType, 
  type PlanType 
} from '@/utils/permissions';

export const usePermissions = () => {
  const { tenant } = useTenant();
  const { usage } = useMonthlyUsage();
  
  const plan = (tenant?.subscription_plan as PlanType) || 'free';
  const limits = getPlanLimits(plan);
  
  const permissions = useMemo(() => ({
    plan,
    hasAccess: (feature: FeatureType) => hasAccess(plan, feature),
    limits,
    usage,
    
    // Feature access
    canAccessChat: hasAccess(plan, 'chat'),
    canAccessSMS: hasAccess(plan, 'sms'),
    canUploadFiles: hasAccess(plan, 'file_upload_chat'),
    canAccessInventory: hasAccess(plan, 'inventory'),
    canAccessAPI: hasAccess(plan, 'api_access'),
    canAccessMultipleWorkshops: hasAccess(plan, 'multiple_workshops'),
    canAccessAdvancedAnalytics: hasAccess(plan, 'advanced_analytics'),
    canAccessBasicBranding: hasAccess(plan, 'custom_branding_basic'),
    canAccessFullBranding: hasAccess(plan, 'custom_branding_full'),
    
    // Limit checks
    canCreateAppointment: isWithinAppointmentLimit(plan, usage.appointments_used),
    canUploadFile: (fileSize: number) => {
      if (!hasAccess(plan, 'file_upload_chat')) return false;
      return isWithinStorageLimit(plan, usage.storage_used + fileSize);
    },
    
    // Usage percentages for UI indicators
    appointmentUsagePercentage: limits.appointments === -1 
      ? 0 
      : Math.min((usage.appointments_used / limits.appointments) * 100, 100),
    storageUsagePercentage: limits.storageBytes === -1 
      ? 0 
      : Math.min((usage.storage_used / limits.storageBytes) * 100, 100),
      
    // Warnings
    isNearAppointmentLimit: limits.appointments !== -1 && 
      (usage.appointments_used / limits.appointments) >= 0.8,
    isNearStorageLimit: limits.storageBytes !== -1 && 
      (usage.storage_used / limits.storageBytes) >= 0.8,
  }), [plan, limits, usage]);

  return permissions;
};

export default usePermissions;
