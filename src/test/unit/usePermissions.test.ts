
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePermissions } from '@/hooks/usePermissions';
import { useTenant } from '@/hooks/useTenant';

vi.mock('@/hooks/useTenant');

const mockUseTenant = vi.mocked(useTenant);

describe('usePermissions Hook', () => {
  it('should return correct permissions for free plan', () => {
    mockUseTenant.mockReturnValue({
      tenant: { 
        id: 'test-id',
        name: 'Test Tenant',
        subscription_plan: 'free',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subdomain: null,
        status: 'active',
        suspended_at: null,
        suspended_by: null,
        trial_until: null,
        is_blocked: false,
      },
      loading: false,
      updateTenant: vi.fn(),
      refreshTenant: vi.fn(),
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.plan).toBe('free');
    expect(result.current.canAccessChat).toBe(false);
    expect(result.current.canAccessSMS).toBe(false);
    expect(result.current.canUploadFiles).toBe(false);
    expect(result.current.canAccessInventory).toBe(false);
    expect(result.current.canAccessAPI).toBe(false);
    expect(result.current.limits.appointments).toBe(10);
    expect(result.current.limits.vehicles).toBe(3);
  });

  it('should return correct permissions for enterprise plan', () => {
    mockUseTenant.mockReturnValue({
      tenant: { 
        id: 'test-id',
        name: 'Test Tenant',
        subscription_plan: 'enterprise',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subdomain: null,
        status: 'active',
        suspended_at: null,
        suspended_by: null,
        trial_until: null,
        is_blocked: false,
      },
      loading: false,
      updateTenant: vi.fn(),
      refreshTenant: vi.fn(),
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.plan).toBe('enterprise');
    expect(result.current.canAccessChat).toBe(true);
    expect(result.current.canAccessSMS).toBe(true);
    expect(result.current.canUploadFiles).toBe(true);
    expect(result.current.canAccessInventory).toBe(true);
    expect(result.current.canAccessAPI).toBe(true);
    expect(result.current.limits.appointments).toBe(-1);
    expect(result.current.limits.vehicles).toBe(-1);
  });

  it('should fallback to free plan when no tenant', () => {
    mockUseTenant.mockReturnValue({
      tenant: null,
      loading: false,
      updateTenant: vi.fn(),
      refreshTenant: vi.fn(),
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.plan).toBe('free');
    expect(result.current.canAccessChat).toBe(false);
  });
});
