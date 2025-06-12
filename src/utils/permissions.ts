
export const planFeatures = {
  appointment: ['free', 'starter', 'pro', 'enterprise'],
  chat: ['starter', 'pro', 'enterprise'],
  sms: ['starter', 'pro', 'enterprise'],
  file_upload_chat: ['starter', 'pro', 'enterprise'], // Updated: now available from Starter
  inventory: ['pro', 'enterprise'],
  api_access: ['enterprise'],
  quotations: ['free', 'starter', 'pro', 'enterprise'],
  multiple_workshops: ['pro', 'enterprise'],
  advanced_analytics: ['enterprise'],
  custom_branding_basic: ['starter', 'pro', 'enterprise'], // Logo + color
  custom_branding_full: ['pro', 'enterprise'], // Full branding
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
  const planNames = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise'
  };
  return `This feature is available starting from the ${planNames[minPlan]} plan.`;
}

// Updated plan limits to match new requirements
export const planLimits = {
  free: {
    appointments: 20, // Updated from 10 to 20
    vehicles: 5, // Updated from 3 to 5
    storage: '100MB',
    storageBytes: 100 * 1024 * 1024, // 100MB in bytes
  },
  starter: {
    appointments: 50,
    vehicles: 10,
    storage: '1GB',
    storageBytes: 1 * 1024 * 1024 * 1024, // 1GB in bytes
  },
  pro: {
    appointments: 200,
    vehicles: 50,
    storage: '10GB',
    storageBytes: 10 * 1024 * 1024 * 1024, // 10GB in bytes
  },
  enterprise: {
    appointments: -1, // unlimited
    vehicles: -1, // unlimited
    storage: 'unlimited',
    storageBytes: -1, // unlimited
  },
} as const;

export function getPlanLimits(plan: PlanType) {
  return planLimits[plan];
}

// New utility functions for plan management
export function formatStorageSize(bytes: number): string {
  if (bytes === -1) return 'Unlimited';
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function isWithinStorageLimit(plan: PlanType, usedBytes: number): boolean {
  const limits = getPlanLimits(plan);
  if (limits.storageBytes === -1) return true; // unlimited
  return usedBytes <= limits.storageBytes;
}

export function isWithinAppointmentLimit(plan: PlanType, usedAppointments: number): boolean {
  const limits = getPlanLimits(plan);
  if (limits.appointments === -1) return true; // unlimited
  return usedAppointments < limits.appointments;
}

export function isWithinVehicleLimit(plan: PlanType, vehicleCount: number): boolean {
  const limits = getPlanLimits(plan);
  if (limits.vehicles === -1) return true; // unlimited
  return vehicleCount < limits.vehicles;
}
