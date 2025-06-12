
-- Add subscription_plan enum type
CREATE TYPE public.subscription_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');

-- Add subscription_plan column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN subscription_plan public.subscription_plan NOT NULL DEFAULT 'free';

-- Create index for performance
CREATE INDEX idx_tenants_subscription_plan ON public.tenants(subscription_plan);

-- Update existing tenants to have 'free' plan (already default, but explicit)
UPDATE public.tenants SET subscription_plan = 'free' WHERE subscription_plan IS NULL;
