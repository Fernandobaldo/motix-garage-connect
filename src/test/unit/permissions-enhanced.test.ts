
import { describe, it, expect } from 'vitest';
import { 
  hasAccess, 
  getPlanLimits, 
  isWithinAppointmentLimit,
  isWithinStorageLimit,
  isWithinVehicleLimit,
  formatStorageSize,
  type PlanType 
} from '@/utils/permissions';

describe('Enhanced Permissions System', () => {
  describe('hasAccess', () => {
    it('should allow starter+ plans to upload files in chat', () => {
      expect(hasAccess('free', 'file_upload_chat')).toBe(false);
      expect(hasAccess('starter', 'file_upload_chat')).toBe(true);
      expect(hasAccess('pro', 'file_upload_chat')).toBe(true);
      expect(hasAccess('enterprise', 'file_upload_chat')).toBe(true);
    });

    it('should restrict inventory to pro+ plans', () => {
      expect(hasAccess('free', 'inventory')).toBe(false);
      expect(hasAccess('starter', 'inventory')).toBe(false);
      expect(hasAccess('pro', 'inventory')).toBe(true);
      expect(hasAccess('enterprise', 'inventory')).toBe(true);
    });

    it('should handle custom branding tiers', () => {
      expect(hasAccess('free', 'custom_branding_basic')).toBe(false);
      expect(hasAccess('starter', 'custom_branding_basic')).toBe(true);
      expect(hasAccess('pro', 'custom_branding_full')).toBe(true);
      expect(hasAccess('starter', 'custom_branding_full')).toBe(false);
    });
  });

  describe('Plan Limits', () => {
    it('should return correct appointment limits', () => {
      expect(getPlanLimits('free').appointments).toBe(20);
      expect(getPlanLimits('starter').appointments).toBe(50);
      expect(getPlanLimits('pro').appointments).toBe(200);
      expect(getPlanLimits('enterprise').appointments).toBe(-1);
    });

    it('should return correct vehicle limits', () => {
      expect(getPlanLimits('free').vehicles).toBe(5);
      expect(getPlanLimits('starter').vehicles).toBe(10);
      expect(getPlanLimits('pro').vehicles).toBe(50);
      expect(getPlanLimits('enterprise').vehicles).toBe(-1);
    });

    it('should return correct storage limits', () => {
      expect(getPlanLimits('free').storageBytes).toBe(100 * 1024 * 1024);
      expect(getPlanLimits('starter').storageBytes).toBe(1024 * 1024 * 1024);
      expect(getPlanLimits('pro').storageBytes).toBe(10 * 1024 * 1024 * 1024);
      expect(getPlanLimits('enterprise').storageBytes).toBe(-1);
    });
  });

  describe('Usage Limit Checks', () => {
    it('should check appointment limits correctly', () => {
      expect(isWithinAppointmentLimit('free', 19)).toBe(true);
      expect(isWithinAppointmentLimit('free', 20)).toBe(false);
      expect(isWithinAppointmentLimit('enterprise', 1000)).toBe(true);
    });

    it('should check storage limits correctly', () => {
      const freeLimit = 100 * 1024 * 1024; // 100MB
      expect(isWithinStorageLimit('free', freeLimit - 1)).toBe(true);
      expect(isWithinStorageLimit('free', freeLimit + 1)).toBe(false);
      expect(isWithinStorageLimit('enterprise', 1000000000)).toBe(true);
    });

    it('should check vehicle limits correctly', () => {
      expect(isWithinVehicleLimit('free', 4)).toBe(true);
      expect(isWithinVehicleLimit('free', 5)).toBe(false);
      expect(isWithinVehicleLimit('enterprise', 100)).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    it('should format storage sizes correctly', () => {
      expect(formatStorageSize(0)).toBe('0 B');
      expect(formatStorageSize(1024)).toBe('1 KB');
      expect(formatStorageSize(1024 * 1024)).toBe('1 MB');
      expect(formatStorageSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatStorageSize(-1)).toBe('Unlimited');
    });
  });
});
