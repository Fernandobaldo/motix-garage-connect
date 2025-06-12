
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PublicLinkManager from '@/components/workshop/PublicLinkManager';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
vi.mock('@/hooks/useAuth');
vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockUseAuth = useAuth as any;
const mockSupabase = supabase as any;

describe('Workshop Link Management Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseAuth.mockReturnValue({
      profile: {
        id: 'workshop-owner-id',
        tenant_id: 'workshop-tenant-id',
        role: 'workshop',
      },
    });

    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Link Management Workflow', () => {
    it('shows generator when no existing link', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      renderWithProviders(<PublicLinkManager />);

      await waitFor(() => {
        expect(screen.getByText('Generate Public Link')).toBeInTheDocument();
      });
    });

    it('shows existing link when available', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: 'existing-link-id',
                slug: 'my-workshop-123',
                is_active: true,
                created_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      });

      renderWithProviders(<PublicLinkManager />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('/book/my-workshop-123')).toBeInTheDocument();
      });
    });

    it('generates new link and updates display', async () => {
      // Start with no existing link
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
            single: vi.fn().mockResolvedValue({
              data: { id: 'workshop-id' },
              error: null,
            }),
          }),
        }),
      });

      // Mock successful link generation
      mockSupabase.rpc.mockResolvedValue({
        data: [{
          link_id: 'new-link-id',
          slug: 'generated-workshop-slug',
          public_url: '/book/generated-workshop-slug',
        }],
        error: null,
      });

      renderWithProviders(<PublicLinkManager />);

      // Should show generator initially
      await waitFor(() => {
        expect(screen.getByText('Generate Public Link')).toBeInTheDocument();
      });

      // Generate link
      const generateButton = screen.getByText('Generate Public Link');
      fireEvent.click(generateButton);

      // Should update to show the new link
      await waitFor(() => {
        expect(screen.getByDisplayValue('/book/generated-workshop-slug')).toBeInTheDocument();
      });
    });

    it('handles link copying functionality', async () => {
      // Mock clipboard API
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: 'link-id',
                slug: 'test-workshop',
                is_active: true,
              },
              error: null,
            }),
          }),
        }),
      });

      renderWithProviders(<PublicLinkManager />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('/book/test-workshop')).toBeInTheDocument();
      });

      const copyButton = screen.getByText('Copy Link');
      fireEvent.click(copyButton);

      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('/book/test-workshop')
      );
    });

    it('handles link deactivation', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'workshop_public_links') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: 'link-id',
                    slug: 'test-workshop',
                    is_active: true,
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: 'link-id', is_active: false }],
                error: null,
              }),
            }),
          };
        }
        return {};
      });

      renderWithProviders(<PublicLinkManager />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('/book/test-workshop')).toBeInTheDocument();
      });

      const deactivateButton = screen.getByText('Deactivate');
      fireEvent.click(deactivateButton);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('workshop_public_links');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
            }),
          }),
        }),
      });

      renderWithProviders(<PublicLinkManager />);

      // Should handle the error without crashing
      await waitFor(() => {
        expect(screen.getByText('Public Booking Link')).toBeInTheDocument();
      });
    });

    it('handles link generation failures', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            single: vi.fn().mockResolvedValue({
              data: { id: 'workshop-id' },
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Failed to generate link' },
      });

      renderWithProviders(<PublicLinkManager />);

      await waitFor(() => {
        expect(screen.getByText('Generate Public Link')).toBeInTheDocument();
      });

      const generateButton = screen.getByText('Generate Public Link');
      fireEvent.click(generateButton);

      // Should handle the error appropriately
      await waitFor(() => {
        expect(screen.getByText('Generate Public Link')).toBeInTheDocument();
      });
    });
  });
});
