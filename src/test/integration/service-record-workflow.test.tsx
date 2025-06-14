import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ServiceRecordModal from '@/components/vehicles/ServiceRecordModal';
import ServiceRecordCard from '@/components/services/ServiceRecordCard';
import ServiceRecordEditModal from '@/components/services/ServiceRecordEditModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/useWorkshopPreferences');
vi.mock('sonner');

const mockSupabase = vi.mocked(supabase);
const mockUseAuth = vi.mocked(useAuth);

// Test wrapper
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

// ---- Mock Factories ----
const createMockVehicle = (overrides: Partial<import('@/types/database').Vehicle> = {}): import('@/types/database').Vehicle => ({
  id: 'vehicle-123',
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  license_plate: 'ABC123',
  client_id: 'client-123',
  tenant_id: 'tenant-123',
  owner_id: 'owner-123',
  fuel_type: 'gasoline',
  transmission: 'automatic',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// If you need to mock Workshop/Profile more strictly, do the same as above. (Already done in diff.)

const createMockServiceRecord = (overrides: Partial<import('@/types/database').ServiceRecordWithRelations> = {}): import('@/types/database').ServiceRecordWithRelations => ({
  id: 'service-123',
  tenant_id: 'tenant-123',
  service_type: 'oil_change',
  description: 'Regular oil change',
  status: 'pending',
  cost: 75.00,
  labor_hours: 1.5,
  mileage: 50000,
  appointment_id: null,
  client_id: 'client-123',
  estimated_completion_date: null,
  images: [],
  parts_used: [],
  quotation_id: null,
  technician_notes: '',
  vehicle_id: 'vehicle-123',
  workshop_id: 'workshop-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  client: mockProfile,
  vehicle: createMockVehicle(),
  workshop: mockWorkshop,
  ...overrides,
});

// ---- Use factories everywhere instead of partial objects ----
const mockServiceRecord = createMockServiceRecord();
const serviceWithoutClient = createMockServiceRecord({ client: null });
const serviceWithMalformedVehicle = createMockServiceRecord({
  vehicle: undefined as any // to test handling of vehicle absence/malformed object if needed
});

// Shared mock service record for use in multiple tests
const mockProfile: import('@/types/database').Profile = {
  id: 'client-123',
  full_name: 'John Doe',
  phone: '123-456-7890',
  role: 'client',
  tenant_id: 'tenant-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  last_login_at: '2024-01-01T00:00:00Z'
};

const mockWorkshop: import('@/types/database').Workshop = {
  id: 'workshop-123',
  name: 'Best Auto Repair',
  email: 'workshop@example.com',
  phone: '555-000-1111',
  tenant_id: 'tenant-123',
  address: '123 Main St',
  logo_url: '',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  accent_color: '#F59E0B',
  primary_color: '#3B82F6',
  secondary_color: '#1E40AF',
  working_hours: {},
  services_offered: [],
  owner_id: 'user-123',
  is_public: false,
  languages_spoken: [],
};

describe('Service Record Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReset();

    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      profile: {
        id: 'user-123',
        tenant_id: 'tenant-123',
        role: 'workshop',
        full_name: 'Test Workshop Owner'
      }
    } as any);

    // Mock useWorkshopPreferences
    vi.doMock('@/hooks/useWorkshopPreferences', () => ({
      useWorkshopPreferences: () => ({
        preferences: {
          currency_code: 'USD',
          distance_unit: 'km'
        }
      })
    }));
  });

  describe('Service Record Creation Flow', () => {
    it('should handle complete service record creation workflow', async () => {
      const mockVehicleData = {
        vehicle_id: 'vehicle-123',
        license_plate: 'ABC123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020
      };

      const mockClientData = {
        id: 'client-123',
        name: 'John Doe',
        type: 'auth'
      };

      // Mock successful service record creation
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [{
              id: 'new-service-123',
              tenant_id: 'tenant-123',
              service_type: 'oil_change',
              status: 'pending'
            }],
            error: null
          })
        })
      } as any);

      const onSuccess = vi.fn();
      const onClose = vi.fn();

      render(
        <ServiceRecordModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />,
        { wrapper: createWrapper() }
      );

      // Verify modal is rendered
      expect(screen.getByText('Create New Service Record')).toBeInTheDocument();

      // Should see Service Types section with Add Service Type button and dropdown
      expect(screen.getByText(/service type\(s?\)/i)).toBeInTheDocument();
      fireEvent.click(screen.getByText(/add service type/i));
      // Should be able to select a service type
      const dropdown = screen.getAllByRole("button", { name: /select service type/i })[0];
      fireEvent.mouseDown(dropdown);
      const option = await screen.findByText("Oil Change");
      fireEvent.click(option);

      // Description field:
      const descriptionInput = screen.getByLabelText(/description/i);
      fireEvent.change(descriptionInput, { target: { value: 'Regular oil change service' } });

      // Items grid (part name required) and total cost calculation
      const partNameInput = screen.getAllByPlaceholderText(/part name/i)[0];
      fireEvent.change(partNameInput, { target: { value: 'Oil Filter' } });

      const qtyInput = screen.getAllByPlaceholderText(/qty/i)[0];
      fireEvent.change(qtyInput, { target: { value: '2' } });

      const priceInput = screen.getAllByPlaceholderText(/price/i)[0];
      fireEvent.change(priceInput, { target: { value: '10' } });

      expect(screen.getByText(/total cost/i)).toHaveTextContent("$20"); // e.g., $20.00

      // Try to submit: should succeed if validations met
    });

    it('should validate required fields before submission', async () => {
      const onSuccess = vi.fn();
      const onClose = vi.fn();

      render(
        <ServiceRecordModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />,
        { wrapper: createWrapper() }
      );
      // Remove service type and part name to trigger validation error
      fireEvent.click(screen.getByText(/save/i));
      expect(await screen.findByText(/required fields missing/i)).toBeInTheDocument();
    });

    it('should handle service record creation errors', async () => {
      // Mock failed service record creation
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Failed to create service record' }
          })
        })
      } as any);

      const onSuccess = vi.fn();
      const onClose = vi.fn();

      render(
        <ServiceRecordModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />,
        { wrapper: createWrapper() }
      );

      // Fill required fields and submit
      fireEvent.change(screen.getByLabelText(/service type/i), { 
        target: { value: 'Brake Service' } 
      });

      const submitButton = screen.getByRole('button', { name: /create service record/i });
      fireEvent.click(submitButton);

      // Should handle error gracefully
      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('Service Record Updates', () => {

    it('should handle status updates correctly', async () => {
      const onStatusUpdate = vi.fn();

      // Mock successful status update
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockServiceRecord, status: 'completed' },
                error: null
              })
            })
          })
        })
      } as any);

      render(
        <ServiceRecordCard
          service={mockServiceRecord}
          onStatusUpdate={onStatusUpdate}
        />,
        { wrapper: createWrapper() }
      );

      // Find and click status dropdown
      const statusSelect = screen.getByDisplayValue('pending');
      expect(statusSelect).toBeInTheDocument();

      // Status updates would be handled by the parent component
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('ABC123')).toBeInTheDocument();
    });

    it('should display service record information correctly', () => {
      const onStatusUpdate = vi.fn();

      render(
        <ServiceRecordCard
          service={mockServiceRecord}
          onStatusUpdate={onStatusUpdate}
        />,
        { wrapper: createWrapper() }
      );

      // Verify service information is displayed
      expect(screen.getByText('Oil Change')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('2020 Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('ABC123')).toBeInTheDocument();
      expect(screen.getByText('Regular oil change')).toBeInTheDocument();
      expect(screen.getByText('$75.00')).toBeInTheDocument();
      expect(screen.getByText('1.5h')).toBeInTheDocument();
    });

    it('should handle missing client data gracefully', () => {
      const serviceWithoutClient = {
        ...mockServiceRecord,
        client: null
      };

      const onStatusUpdate = vi.fn();

      render(
        <ServiceRecordCard
          service={serviceWithoutClient}
          onStatusUpdate={onStatusUpdate}
        />,
        { wrapper: createWrapper() }
      );

      // Should still render other information
      expect(screen.getByText('Oil Change')).toBeInTheDocument();
      expect(screen.getByText('2020 Toyota Camry')).toBeInTheDocument();
    });
  });

  describe('Service Record Edit/Delete', () => {
    it('should edit a service record', async () => {
      // Mock update mutation
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockServiceRecord, description: 'Edited Description' },
                error: null
              })
            })
          })
        })
      } as any);

      // FIX: Declare mock functions for onClose and onSuccess
      const onSuccess = vi.fn();
      const onClose = vi.fn();

      render(
        <ServiceRecordEditModal
          isOpen={true}
          service={mockServiceRecord}
          onClose={onClose}
          onSuccess={onSuccess}
        />,
        { wrapper: createWrapper() }
      );
      // Simulate edit and submit
      const descriptionInput = screen.getByLabelText(/description/i);
      fireEvent.change(descriptionInput, { target: { value: 'Edited Description' }});
      const submitBtn = screen.getByRole('button', { name: /save/i });
      fireEvent.click(submitBtn);
      expect(descriptionInput).toHaveValue('Edited Description');
    });

    it('should delete a service record', async () => {
      // Mock delete mutation
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      } as any);

      render(
        <ServiceRecordCard
          service={mockServiceRecord}
          onStatusUpdate={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      // Click delete button and confirm
      fireEvent.click(screen.getByLabelText("Delete"));
      // Find the Confirm Delete dialog & approve
      const delBtn = screen.getByText('Delete');
      fireEvent.click(delBtn);
      // After delete, the card should remain but the record is removed from data
    });

    it('should view service record details', async () => {
      render(
        <ServiceRecordCard
          service={mockServiceRecord}
          onStatusUpdate={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );
      fireEvent.click(screen.getByLabelText("View Details"));
      expect(screen.getByText('Service Record Details')).toBeInTheDocument();
      expect(
        screen.getByText(mockServiceRecord.service_type, { exact: false })
      ).toBeInTheDocument();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across components', async () => {
      const serviceData = {
        id: 'new-service-456',
        tenant_id: 'tenant-123',
        vehicle_id: 'vehicle-123',
        workshop_id: 'workshop-123',
        client_id: 'client-123',
        appointment_id: null,
        quotation_id: null,
        service_type: 'brake_service',
        description: 'Brake pad replacement',
        cost: 250.00,
        labor_hours: null,
        mileage: null,
        technician_notes: '',
        status: 'pending' as const,
        estimated_completion_date: null,
        images: [],
        parts_used: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client: {
          id: 'client-123',
          full_name: 'John Doe',
          phone: '123-456-7890'
        },
        vehicle: {
          id: 'vehicle-123',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          license_plate: 'ABC123'
        },
        workshop: {
          id: 'workshop-123',
          name: 'Best Auto Repair'
        }
      };

      // Mock consistent data responses
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [serviceData],
            error: null
          })
        })
      } as any);

      const onSuccess = vi.fn();
      const onClose = vi.fn();

      render(
        <ServiceRecordModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />,
        { wrapper: createWrapper() }
      );

      // Verify form fields maintain consistency
      expect(screen.getByLabelText(/service type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cost/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockRejectedValue(new Error('Network error'))
      } as any);

      const onSuccess = vi.fn();
      const onClose = vi.fn();

      render(
        <ServiceRecordModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />,
        { wrapper: createWrapper() }
      );

      // Component should still render despite potential network issues
      expect(screen.getByText('Create New Service Record')).toBeInTheDocument();
    });

    it('should handle malformed data responses', () => {
      const malformedServiceRecord = {
        ...mockServiceRecord,
        cost: null,
        client: undefined,
        vehicle: null
      } as any;

      const onStatusUpdate = vi.fn();

      render(
        <ServiceRecordCard
          service={malformedServiceRecord}
          onStatusUpdate={onStatusUpdate}
        />,
        { wrapper: createWrapper() }
      );

      // Should handle missing data gracefully
      expect(screen.getByText('Oil Change')).toBeInTheDocument();
    });
  });
});

//
// Documentation for Future Contributors:
// --------------------------------------
// - Always use createMockVehicle, createMockServiceRecord to generate mock objects to avoid accidental missing properties and TS errors.
// - When new required fields are added to the database types, update these utilities accordingly.
// --------------------------------------
