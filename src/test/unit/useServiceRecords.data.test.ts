import { renderHook, waitFor } from '@testing-library/react';
import { useServiceRecords } from '@/hooks/useServiceRecords';
import {
  mockSupabase,
  mockUseAuth,
  createWrapper,
  setupBaseMockAuth,
} from './useServiceRecords.test-helpers.tsx';

import { describe, it, beforeEach, expect } from 'vitest';

describe('useServiceRecords - Data Fetching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBaseMockAuth();
  });

  it('should fetch service records with proper tenant filtering', async () => {
    const mockServiceRecords = [
      {
        id: 'service-1',
        tenant_id: 'tenant-123',
        service_type: 'oil_change',
        status: 'pending',
        client_id: 'client-1',
        vehicle_id: 'vehicle-1',
        workshop_id: 'workshop-1',
        created_at: '2024-01-01T00:00:00Z',
      },
    ];

    const mockClients = [
      { id: 'client-1', full_name: 'John Doe', phone: '123-456-7890' },
    ];

    const mockVehicles = [
      { id: 'vehicle-1', make: 'Toyota', model: 'Camry', year: 2020, license_plate: 'ABC123' },
    ];

    const mockWorkshops = [
      { id: 'workshop-1', name: 'Best Auto Repair' },
    ];

    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockServiceRecords,
              error: null,
            }),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: mockClients,
            error: null,
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: mockWorkshops,
            error: null,
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: mockVehicles,
            error: null,
          }),
        }),
      } as any);

    const { result } = renderHook(() => useServiceRecords(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.serviceRecords).toHaveLength(1);
    expect(result.current.serviceRecords[0]).toMatchObject({
      id: 'service-1',
      tenant_id: 'tenant-123',
      service_type: 'oil_change',
      status: 'pending',
    });
  });

  it('should return empty array when user or tenant_id is missing', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
    } as any);

    const { result } = renderHook(() => useServiceRecords(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.serviceRecords).toEqual([]);
  });
});
