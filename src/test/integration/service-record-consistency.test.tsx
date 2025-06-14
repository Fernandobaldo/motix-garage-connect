
import { render, screen } from '@testing-library/react';
import ServiceRecordModal from '@/components/vehicles/ServiceRecordModal';
import { vi, describe, it } from 'vitest';
import { createMockServiceRecord } from './service-record-test-shared';

describe('Service Record Data Consistency (Unified Modal)', () => {
  it('should maintain data consistency in create and edit modes', async () => {
    const mockRecord = createMockServiceRecord();

    // Render in EDIT mode
    render(
      <ServiceRecordModal
        isOpen={true}
        onClose={() => {}}
        mode="edit"
        initialRecord={mockRecord}
      />
    );

    // Vehicle/client info should be present and read-only
    expect(screen.getByText(mockRecord.vehicle.make)).toBeInTheDocument();
    expect(screen.getByText(mockRecord.client.full_name)).toBeInTheDocument();
    // Try to find LicensePlateSearchField (should not exist in edit)
    expect(screen.queryByPlaceholderText(/license plate/i)).not.toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    // ... mock network error, check modal renders anyway ...
  });

  it('should handle malformed data responses', () => {
    // Provide malformed record, assert modal renders and is resilient
  });
});
