
import { describe, it, expect } from 'vitest';
import { hasAccess, getMinimumPlanForFeature, getUpgradeMessage, getPlanLimits, planFeatures } from '../permissions';

describe('Permission System', () => {
  describe('hasAccess', () => {
    it('should allow free users access to free features', () => {
      expect(hasAccess('free', 'appointment')).toBe(true);
      expect(hasAccess('free', 'quotations')).toBe(true);
    });

    it('should deny free users access to premium features', () => {
      expect(hasAccess('free', 'chat')).toBe(false);
      expect(hasAccess('free', 'sms')).toBe(false);
      expect(hasAccess('free', 'file_upload_chat')).toBe(false);
      expect(hasAccess('free', 'inventory')).toBe(false);
      expect(hasAccess('free', 'api_access')).toBe(false);
    });

    it('should allow starter users access to starter features', () => {
      expect(hasAccess('starter', 'appointment')).toBe(true);
      expect(hasAccess('starter', 'chat')).toBe(true);
      expect(hasAccess('starter', 'sms')).toBe(true);
      expect(hasAccess('starter', 'quotations')).toBe(true);
    });

    it('should deny starter users access to pro/enterprise features', () => {
      expect(hasAccess('starter', 'file_upload_chat')).toBe(false);
      expect(hasAccess('starter', 'inventory')).toBe(false);
      expect(hasAccess('starter', 'api_access')).toBe(false);
    });

    it('should allow pro users access to pro features', () => {
      expect(hasAccess('pro', 'appointment')).toBe(true);
      expect(hasAccess('pro', 'chat')).toBe(true);
      expect(hasAccess('pro', 'sms')).toBe(true);
      expect(hasAccess('pro', 'file_upload_chat')).toBe(true);
      expect(hasAccess('pro', 'inventory')).toBe(true);
      expect(hasAccess('pro', 'multiple_workshops')).toBe(true);
      expect(hasAccess('pro', 'custom_branding')).toBe(true);
    });

    it('should deny pro users access to enterprise features', () => {
      expect(hasAccess('pro', 'api_access')).toBe(false);
      expect(hasAccess('pro', 'advanced_analytics')).toBe(false);
    });

    it('should allow enterprise users access to all features', () => {
      const features = Object.keys(planFeatures) as Array<keyof typeof planFeatures>;
      features.forEach(feature => {
        expect(hasAccess('enterprise', feature)).toBe(true);
      });
    });

    it('should fallback to free for invalid plans', () => {
      expect(hasAccess('invalid', 'appointment')).toBe(true);
      expect(hasAccess('invalid', 'chat')).toBe(false);
      expect(hasAccess('', 'appointment')).toBe(true);
      expect(hasAccess('', 'chat')).toBe(false);
    });
  });

  describe('getMinimumPlanForFeature', () => {
    it('should return correct minimum plans', () => {
      expect(getMinimumPlanForFeature('appointment')).toBe('free');
      expect(getMinimumPlanForFeature('chat')).toBe('starter');
      expect(getMinimumPlanForFeature('file_upload_chat')).toBe('pro');
      expect(getMinimumPlanForFeature('api_access')).toBe('enterprise');
    });
  });

  describe('getUpgradeMessage', () => {
    it('should return correct upgrade messages', () => {
      expect(getUpgradeMessage('chat')).toBe('This feature is available starting from the starter plan.');
      expect(getUpgradeMessage('file_upload_chat')).toBe('This feature is available starting from the pro plan.');
      expect(getUpgradeMessage('api_access')).toBe('This feature is available starting from the enterprise plan.');
    });
  });

  describe('getPlanLimits', () => {
    it('should return correct limits for each plan', () => {
      const freeLimits = getPlanLimits('free');
      expect(freeLimits.appointments).toBe(10);
      expect(freeLimits.vehicles).toBe(3);
      expect(freeLimits.storage).toBe('100MB');

      const enterpriseLimits = getPlanLimits('enterprise');
      expect(enterpriseLimits.appointments).toBe(-1);
      expect(enterpriseLimits.vehicles).toBe(-1);
      expect(enterpriseLimits.storage).toBe('unlimited');
    });
  });
});
