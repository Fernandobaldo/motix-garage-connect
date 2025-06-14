
import { renderHook, waitFor } from '@testing-library/react';
import { useServiceRecords } from '@/hooks/useServiceRecords';
import {
  mockSupabase,
  createWrapper,
  setupBaseMockAuth,
} from './useServiceRecords.test-helpers';
import { describe, it, beforeEach, expect } from 'vitest';

describe('useServiceRecords - Service Record Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBaseMockAuth();
  });

  it('should create service record with proper data validation', async () => {
    const mockCreatedRecord = {
      id: 'new-service-1',
      tenant_id: 'tenant-123',
      service_type: 'brake_service',
      status: 'pending',
    };

    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockCreatedRecord,
            error: null,
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useServiceRecords(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const serviceData = {
      tenant_id: 'tenant-123',
      vehicle_id: 'vehicle-1',
      workshop_id: 'workshop-1',
      client_id: 'client-1',
      service_type: 'brake_service',
      description: 'Brake pad replacement',
      cost: 250.00,
      status: 'pending' as const,
    };

    result.current.createServiceRecord(serviceData);
    expect(mockSupabase.from).toHaveBeenCalledWith('service_records');
  });
});
