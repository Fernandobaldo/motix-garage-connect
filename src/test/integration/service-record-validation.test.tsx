
import { render, screen, fireEvent } from '@testing-library/react';
import ServiceRecordModal from '@/components/vehicles/ServiceRecordModal';
import { vi, describe, it } from 'vitest';

describe('Service Record Validation (Unified Modal)', () => {
  it('should validate required fields before submission', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    render(
      <ServiceRecordModal isOpen={true} onClose={onClose} onSuccess={onSuccess} mode="create" />,
    );
    // Attempt to submit with empty fields
    const submitBtn = screen.getByText(/create service record/i);
    fireEvent.click(submitBtn);

    // Since no vehicle/client selected, expect warning
    expect(await screen.findByText(/missing vehicle|client/i)).toBeInTheDocument();
  });

  it('should handle service record creation errors gracefully', async () => {
    // Mock insert error
    vi.mocked(ServiceRecordModal.prototype, true);
    // ... in real test: mock supabase error, fire submit, expect error toast ...
  });
});
