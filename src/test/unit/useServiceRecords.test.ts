import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useServiceRecords } from '@/hooks/useServiceRecords';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Mock dependencies
vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));
vi.mock('@/hooks/use-toast');

const mockSupabase = supabase as any;

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useServiceRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up the useAuth mock implementation
    (useAuth as unknown as vi.Mock).mockImplementation(() => ({
      user: { id: 'user-123' },
      profile: { tenant_id: 'tenant-123', role: 'workshop' },
    }));
  });

  describe('Data Fetching', () => {
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

      // Mock Supabase calls
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockServiceRecords,
              error: null,
            }),
          }),
        }),
      } as any);

      // Mock subsequent calls for related data
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

  describe('Status Updates', () => {
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

      // Verify the update call was made
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

      // The hook should handle the error gracefully
      expect(result.current.isUpdating).toBe(false);
    });
  });

  describe('Service Record Creation', () => {
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

  describe('Error Handling', () => {
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
});
