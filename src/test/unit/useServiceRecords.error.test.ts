import { renderHook, waitFor } from '@testing-library/react';
import { useServiceRecords } from '@/hooks/useServiceRecords';
import {
  mockSupabase,
  createWrapper,
  setupBaseMockAuth,
} from './useServiceRecords.test-helpers.tsx';
import { describe, it, beforeEach, expect } from 'vitest';

describe('useServiceRecords - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBaseMockAuth();
  });

  it('should handle network errors gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockRejectedValue(new Error('Network error')),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useServiceRecords(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.serviceRecords).toEqual([]);
  });

  it('should handle malformed data responses', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid response' },
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

    expect(result.current.serviceRecords).toEqual([]);
  });
});
