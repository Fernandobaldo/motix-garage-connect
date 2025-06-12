
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeatureAccess from '../permissions/FeatureAccess';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/hooks/use-toast';

// Mock the hooks
vi.mock('@/hooks/useTenant');
vi.mock('@/hooks/use-toast');

const mockUseTenant = vi.mocked(useTenant);
const mockUseToast = vi.mocked(useToast);

describe('FeatureAccess Component', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseToast.mockReturnValue({ 
      toast: mockToast,
      dismiss: vi.fn(),
      toasts: []
    });
  });

  it('should render children when user has access', () => {
    mockUseTenant.mockReturnValue({
      tenant: { 
        id: 'test-id',
        name: 'Test Tenant',
        subscription_plan: 'pro',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subdomain: null,
      },
      loading: false,
      updateTenant: vi.fn(),
      refreshTenant: vi.fn(),
    });

    render(
      <FeatureAccess feature="file_upload_chat">
        <div>Premium Feature Content</div>
      </FeatureAccess>
    );

    expect(screen.getByText('Premium Feature Content')).toBeInTheDocument();
    expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument();
  });

  it('should show upgrade prompt when user lacks access', () => {
    mockUseTenant.mockReturnValue({
      tenant: { 
        id: 'test-id',
        name: 'Test Tenant',
        subscription_plan: 'free',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subdomain: null,
      },
      loading: false,
      updateTenant: vi.fn(),
      refreshTenant: vi.fn(),
    });

    render(
      <FeatureAccess feature="chat">
        <div>Chat Feature Content</div>
      </FeatureAccess>
    );

    expect(screen.queryByText('Chat Feature Content')).not.toBeInTheDocument();
    expect(screen.getByText('Premium Feature')).toBeInTheDocument();
    expect(screen.getByText(/This feature is available starting from the starter plan/)).toBeInTheDocument();
    expect(screen.getByText('Upgrade Now')).toBeInTheDocument();
  });

  it('should show custom fallback when provided', () => {
    mockUseTenant.mockReturnValue({
      tenant: { 
        id: 'test-id',
        name: 'Test Tenant',
        subscription_plan: 'free',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subdomain: null,
      },
      loading: false,
      updateTenant: vi.fn(),
      refreshTenant: vi.fn(),
    });

    const customFallback = <div>Custom Locked Message</div>;

    render(
      <FeatureAccess feature="chat" fallback={customFallback}>
        <div>Chat Feature Content</div>
      </FeatureAccess>
    );

    expect(screen.getByText('Custom Locked Message')).toBeInTheDocument();
    expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument();
  });

  it('should handle upgrade click and show toast', () => {
    mockUseTenant.mockReturnValue({
      tenant: { 
        id: 'test-id',
        name: 'Test Tenant',
        subscription_plan: 'free',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subdomain: null,
      },
      loading: false,
      updateTenant: vi.fn(),
      refreshTenant: vi.fn(),
    });

    render(
      <FeatureAccess feature="inventory">
        <div>Inventory Content</div>
      </FeatureAccess>
    );

    const upgradeButton = screen.getByText('Upgrade Now');
    fireEvent.click(upgradeButton);

    expect(mockToast).toHaveBeenCalledWith({
      title: "Upgrade Required",
      description: "This feature is available starting from the pro plan.",
      variant: "default",
    });
  });

  it('should use userPlan prop when provided', () => {
    mockUseTenant.mockReturnValue({
      tenant: { 
        id: 'test-id',
        name: 'Test Tenant',
        subscription_plan: 'free',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subdomain: null,
      },
      loading: false,
      updateTenant: vi.fn(),
      refreshTenant: vi.fn(),
    });

    render(
      <FeatureAccess feature="chat" userPlan="starter">
        <div>Chat Content</div>
      </FeatureAccess>
    );

    expect(screen.getByText('Chat Content')).toBeInTheDocument();
  });

  it('should fallback to free plan when no tenant', () => {
    mockUseTenant.mockReturnValue({
      tenant: null,
      loading: false,
      updateTenant: vi.fn(),
      refreshTenant: vi.fn(),
    });

    render(
      <FeatureAccess feature="appointment">
        <div>Appointment Content</div>
      </FeatureAccess>
    );

    expect(screen.getByText('Appointment Content')).toBeInTheDocument();
  });
});
