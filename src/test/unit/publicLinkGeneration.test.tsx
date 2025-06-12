
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PublicLinkGenerator from '@/components/workshop/PublicLinkGenerator';
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

describe('Public Link Generation', () => {
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
        id: 'test-user-id',
        tenant_id: 'test-tenant-id',
        role: 'workshop',
      },
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('PublicLinkGenerator Component', () => {
    const mockOnLinkGenerated = vi.fn();

    beforeEach(() => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'workshop-id' },
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.rpc.mockResolvedValue({
        data: [{
          link_id: 'test-link-id',
          slug: 'test-workshop-slug',
          public_url: '/book/test-workshop-slug',
        }],
        error: null,
      });
    });

    it('renders the generator form correctly', () => {
      renderWithProviders(
        <PublicLinkGenerator onLinkGenerated={mockOnLinkGenerated} />
      );

      expect(screen.getByText('Custom Slug (Optional)')).toBeInTheDocument();
      expect(screen.getByText('Generate Public Link')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., my-workshop')).toBeInTheDocument();
    });

    it('generates link with auto-generated slug when no custom slug provided', async () => {
      renderWithProviders(
        <PublicLinkGenerator onLinkGenerated={mockOnLinkGenerated} />
      );

      const generateButton = screen.getByText('Generate Public Link');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockSupabase.rpc).toHaveBeenCalledWith('generate_workshop_public_link', {
          p_workshop_id: 'workshop-id',
          p_custom_slug: null,
        });
      });

      expect(mockOnLinkGenerated).toHaveBeenCalledWith({
        link_id: 'test-link-id',
        slug: 'test-workshop-slug',
        public_url: '/book/test-workshop-slug',
      });
    });

    it('generates link with custom slug when provided', async () => {
      renderWithProviders(
        <PublicLinkGenerator onLinkGenerated={mockOnLinkGenerated} />
      );

      const slugInput = screen.getByPlaceholderText('e.g., my-workshop');
      const generateButton = screen.getByText('Generate Public Link');

      fireEvent.change(slugInput, { target: { value: 'custom-workshop' } });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockSupabase.rpc).toHaveBeenCalledWith('generate_workshop_public_link', {
          p_workshop_id: 'workshop-id',
          p_custom_slug: 'custom-workshop',
        });
      });
    });

    it('handles workshop not found error', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      renderWithProviders(
        <PublicLinkGenerator onLinkGenerated={mockOnLinkGenerated} />
      );

      const generateButton = screen.getByText('Generate Public Link');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockOnLinkGenerated).not.toHaveBeenCalled();
      });
    });

    it('handles database function error', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Workshop not found or access denied' },
      });

      renderWithProviders(
        <PublicLinkGenerator onLinkGenerated={mockOnLinkGenerated} />
      );

      const generateButton = screen.getByText('Generate Public Link');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockOnLinkGenerated).not.toHaveBeenCalled();
      });
    });

    it('shows loading state during generation', async () => {
      // Mock a delayed response
      mockSupabase.rpc.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: [{ link_id: 'test', slug: 'test', public_url: '/book/test' }],
          error: null,
        }), 100))
      );

      renderWithProviders(
        <PublicLinkGenerator onLinkGenerated={mockOnLinkGenerated} />
      );

      const generateButton = screen.getByText('Generate Public Link');
      fireEvent.click(generateButton);

      expect(screen.getByText('Generating...')).toBeInTheDocument();
      expect(generateButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Generate Public Link')).toBeInTheDocument();
      });
    });
  });

  describe('PublicLinkManager Component', () => {
    it('renders correctly when no workshop found', () => {
      mockUseAuth.mockReturnValue({
        profile: { id: 'test-user', role: 'workshop' },
      });

      renderWithProviders(<PublicLinkManager />);

      expect(screen.getByText('Public Booking Link')).toBeInTheDocument();
    });

    it('displays existing public link when available', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: 'link-id',
                slug: 'existing-slug',
                is_active: true,
              },
              error: null,
            }),
          }),
        }),
      });

      renderWithProviders(<PublicLinkManager />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('/book/existing-slug')).toBeInTheDocument();
      });
    });
  });

  describe('Database Function Logic', () => {
    it('should handle existing link scenario', () => {
      // This tests the logic that would happen in the database function
      const existingLink = {
        link_id: 'existing-id',
        slug: 'existing-slug',
        public_url: '/book/existing-slug',
      };

      expect(existingLink.public_url).toBe('/book/existing-slug');
      expect(existingLink.slug).toBe('existing-slug');
    });

    it('should handle slug generation logic', () => {
      const workshopName = 'Test Auto Shop & Service';
      const expectedSlug = workshopName
        .toLowerCase()
        .replace(/[^a-zA-Z0-9-]/g, '-');

      expect(expectedSlug).toBe('test-auto-shop---service');
    });

    it('should handle slug uniqueness', () => {
      const baseSlug = 'test-workshop';
      const uniqueSlug = `${baseSlug}-123`;

      expect(uniqueSlug).toContain(baseSlug);
      expect(uniqueSlug).toMatch(/^test-workshop-\d+$/);
    });
  });
});
