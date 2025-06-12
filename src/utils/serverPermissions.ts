
import { supabase } from '@/integrations/supabase/client';
import { hasAccess, type FeatureType, type PlanType } from './permissions';

export async function checkUserPlanPermission(
  userId: string, 
  feature: FeatureType
): Promise<{ hasPermission: boolean; plan: PlanType }> {
  try {
    // Get user's tenant and plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', userId)
      .single();

    if (!profile?.tenant_id) {
      return { hasPermission: false, plan: 'free' };
    }

    const { data: tenant } = await supabase
      .from('tenants')
      .select('subscription_plan')
      .eq('id', profile.tenant_id)
      .single();

    const plan = (tenant?.subscription_plan as PlanType) || 'free';
    const hasPermission = hasAccess(plan, feature);

    return { hasPermission, plan };
  } catch (error) {
    console.error('Error checking plan permission:', error);
    return { hasPermission: false, plan: 'free' };
  }
}

export function createPlanRestrictedHandler<T>(
  feature: FeatureType,
  handler: (userId: string, ...args: any[]) => Promise<T>
) {
  return async (userId: string, ...args: any[]): Promise<T> => {
    const { hasPermission } = await checkUserPlanPermission(userId, feature);
    
    if (!hasPermission) {
      throw new Error(`Feature '${feature}' requires a higher subscription plan`);
    }

    return handler(userId, ...args);
  };
}
