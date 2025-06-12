
export const planFeatures = {
  appointment: ['free', 'starter', 'pro', 'enterprise'],
  chat: ['starter', 'pro', 'enterprise'],
  sms: ['starter', 'pro', 'enterprise'],
  file_upload_chat: ['pro', 'enterprise'],
  inventory: ['pro', 'enterprise'],
  api_access: ['enterprise'],
  quotations: ['free', 'starter', 'pro', 'enterprise'],
  multiple_workshops: ['pro', 'enterprise'],
  advanced_analytics: ['enterprise'],
  custom_branding: ['pro', 'enterprise'],
} as const;

export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';
export type FeatureType = keyof typeof planFeatures;

export function hasAccess(plan: PlanType | string, feature: FeatureType): boolean {
  // Ensure plan is a valid PlanType, fallback to 'free' if invalid
  const validPlans: readonly PlanType[] = ['free', 'starter', 'pro', 'enterprise'];
  const validPlan = validPlans.includes(plan as PlanType) 
    ? (plan as PlanType) 
    : 'free';
  return (planFeatures[feature] as readonly PlanType[]).includes(validPlan);
}

export function getMinimumPlanForFeature(feature: FeatureType): PlanType {
  return planFeatures[feature][0] as PlanType;
}

export function getUpgradeMessage(feature: FeatureType): string {
  const minPlan = getMinimumPlanForFeature(feature);
  return `This feature is available starting from the ${minPlan} plan.`;
}

export const planLimits = {
  free: {
    appointments: 10,
    vehicles: 3,
    storage: '100MB',
  },
  starter: {
    appointments: 50,
    vehicles: 10,
    storage: '1GB',
  },
  pro: {
    appointments: 200,
    vehicles: 50,
    storage: '10GB',
  },
  enterprise: {
    appointments: -1, // unlimited
    vehicles: -1, // unlimited
    storage: 'unlimited',
  },
} as const;

export function getPlanLimits(plan: PlanType) {
  return planLimits[plan];
}
