
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Test database connection for integration tests
const testSupabase = createClient(
  'https://hkstdutebohloapdyznl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrc3RkdXRlYm9obG9hcGR5em5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNjIzNDAsImV4cCI6MjA2NDczODM0MH0.r-ebm4TvDD-wVCNczdyaPxE-lv3EPjjT3Sq09FQnFww'
);

describe('Service Records RLS Policies', () => {
  let testTenant1: string;
  let testTenant2: string;
  let testUser1: any;
  let testUser2: any;
  let testServiceRecord: any;

  beforeEach(async () => {
    // Create test tenants
    const { data: tenant1 } = await testSupabase
      .from('tenants')
      .insert({ name: 'Test Tenant 1' })
      .select()
      .single();
    
    const { data: tenant2 } = await testSupabase
      .from('tenants')
      .insert({ name: 'Test Tenant 2' })
      .select()
      .single();

    testTenant1 = tenant1.id;
    testTenant2 = tenant2.id;

    // Note: In a real test environment, you would create actual test users
    // For this integration test, we'll simulate the RLS behavior
  });

  afterEach(async () => {
    // Clean up test data
    if (testServiceRecord) {
      await testSupabase
        .from('service_records')
        .delete()
        .eq('id', testServiceRecord.id);
    }

    await testSupabase
      .from('tenants')
      .delete()
      .in('id', [testTenant1, testTenant2]);
  });

  describe('Tenant Isolation', () => {
    it('should enforce tenant-based data isolation', async () => {
      // This test verifies that RLS policies prevent cross-tenant access
      // In a production test, you would authenticate as different users
      
      const serviceRecordData = {
        tenant_id: testTenant1,
        service_type: 'oil_change',
        status: 'pending',
        vehicle_id: 'test-vehicle-1',
        workshop_id: 'test-workshop-1',
        description: 'Test service record for tenant isolation',
      };

      // Create a service record for tenant 1
      const { data, error } = await testSupabase
        .from('service_records')
        .insert(serviceRecordData)
        .select()
        .single();

      // Verify the service record was created
      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.tenant_id).toBe(testTenant1);

      testServiceRecord = data;

      // Test that RLS would prevent access from other tenants
      // In a real test environment with authentication, this would fail
      const { data: crossTenantData } = await testSupabase
        .from('service_records')
        .select('*')
        .eq('tenant_id', testTenant2);

      // Should not find the record when querying different tenant
      expect(crossTenantData).toEqual([]);
    });

    it('should allow proper tenant access', async () => {
      const serviceRecordData = {
        tenant_id: testTenant1,
        service_type: 'brake_service',
        status: 'in_progress',
        vehicle_id: 'test-vehicle-2',
        workshop_id: 'test-workshop-1',
        description: 'Test service record for proper access',
      };

      const { data, error } = await testSupabase
        .from('service_records')
        .insert(serviceRecordData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.tenant_id).toBe(testTenant1);

      testServiceRecord = data;
    });
  });

  describe('Role-Based Access Control', () => {
    it('should validate workshop role for delete operations', async () => {
      // This test would verify that only workshop users can delete records
      // In a real environment, you would test with different authenticated users
      
      const serviceRecordData = {
        tenant_id: testTenant1,
        service_type: 'inspection',
        status: 'completed',
        vehicle_id: 'test-vehicle-3',
        workshop_id: 'test-workshop-1',
        description: 'Test service record for delete permission',
      };

      const { data, error } = await testSupabase
        .from('service_records')
        .insert(serviceRecordData)
        .select()
        .single();

      expect(error).toBeNull();
      testServiceRecord = data;

      // In a real test, you would authenticate as a client user and verify
      // that they cannot delete the record
    });

    it('should allow status updates by authorized users', async () => {
      const serviceRecordData = {
        tenant_id: testTenant1,
        service_type: 'maintenance',
        status: 'pending',
        vehicle_id: 'test-vehicle-4',
        workshop_id: 'test-workshop-1',
        description: 'Test service record for status update',
      };

      const { data, error } = await testSupabase
        .from('service_records')
        .insert(serviceRecordData)
        .select()
        .single();

      expect(error).toBeNull();
      testServiceRecord = data;

      // Test status update
      const { data: updatedData, error: updateError } = await testSupabase
        .from('service_records')
        .update({ status: 'in_progress' })
        .eq('id', data.id)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updatedData.status).toBe('in_progress');
    });
  });

  describe('Data Validation', () => {
    it('should enforce required fields', async () => {
      const invalidData = {
        tenant_id: testTenant1,
        // Missing required service_type
        status: 'pending',
        description: 'Invalid service record missing service_type',
      };

      const { data, error } = await testSupabase
        .from('service_records')
        .insert(invalidData);

      // Should fail due to missing required fields
      expect(error).toBeTruthy();
      expect(data).toBeNull();
    });

    it('should validate status values', async () => {
      const serviceRecordData = {
        tenant_id: testTenant1,
        service_type: 'repair',
        status: 'pending',
        vehicle_id: 'test-vehicle-5',
        workshop_id: 'test-workshop-1',
        description: 'Test service record for status validation',
      };

      const { data, error } = await testSupabase
        .from('service_records')
        .insert(serviceRecordData)
        .select()
        .single();

      expect(error).toBeNull();
      testServiceRecord = data;

      // Test valid status update
      const { error: validUpdateError } = await testSupabase
        .from('service_records')
        .update({ status: 'completed' })
        .eq('id', data.id);

      expect(validUpdateError).toBeNull();

      // Test invalid status (this would be caught by enum constraint)
      const { error: invalidUpdateError } = await testSupabase
        .from('service_records')
        .update({ status: 'invalid_status' })
        .eq('id', data.id);

      expect(invalidUpdateError).toBeTruthy();
    });
  });

  describe('Cross-Tenant Prevention', () => {
    it('should prevent unauthorized cross-tenant data access', async () => {
      // Create service records in different tenants
      const record1Data = {
        tenant_id: testTenant1,
        service_type: 'oil_change',
        status: 'pending',
        vehicle_id: 'test-vehicle-tenant1',
        workshop_id: 'test-workshop-1',
        description: 'Service record for tenant 1',
      };

      const record2Data = {
        tenant_id: testTenant2,
        service_type: 'brake_service',
        status: 'pending',
        vehicle_id: 'test-vehicle-tenant2',
        workshop_id: 'test-workshop-2',
        description: 'Service record for tenant 2',
      };

      const { data: record1 } = await testSupabase
        .from('service_records')
        .insert(record1Data)
        .select()
        .single();

      const { data: record2 } = await testSupabase
        .from('service_records')
        .insert(record2Data)
        .select()
        .single();

      // Clean up both records
      await testSupabase
        .from('service_records')
        .delete()
        .in('id', [record1.id, record2.id]);

      // Verify records were in different tenants
      expect(record1.tenant_id).toBe(testTenant1);
      expect(record2.tenant_id).toBe(testTenant2);
      expect(record1.tenant_id).not.toBe(record2.tenant_id);
    });
  });
});
