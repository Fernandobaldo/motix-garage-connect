import { renderHook, waitFor } from '@testing-library/react';
import { useServiceRecords } from '@/hooks/useServiceRecords';
import {
  mockSupabase,
  createWrapper,
  setupBaseMockAuth,
} from './useServiceRecords.test-helpers.tsx';
import { describe, it, beforeEach, expect } from 'vitest';

describe('useServiceRecords - Status Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBaseMockAuth();
  });

  it('should update service status successfully', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'service-1', status: 'completed' },
              error: null,
            }),
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

    result.current.updateServiceStatus('service-1', 'completed');
    expect(mockSupabase.from).toHaveBeenCalledWith('service_records');
  });

  it('should handle status update errors', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Update failed' },
            }),
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

    result.current.updateServiceStatus('service-1', 'completed');
    expect(result.current.isUpdating).toBe(false);
  });
});
