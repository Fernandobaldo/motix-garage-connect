
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Quotation = Tables<'quotations'> & {
  items?: QuotationItem[];
  client?: { full_name: string; email?: string };
  vehicle?: { make: string; model: string; year: number; license_plate: string };
  workshop?: { name: string };
};

export type QuotationItem = Tables<'quotation_items'>;
export type QuoteTemplate = Tables<'quote_templates'>;

export const useQuotations = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchQuotations = async () => {
    if (!profile?.tenant_id) return;
    
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          items:quotation_items(*),
          client:profiles!quotations_client_id_fkey(full_name),
          vehicle:vehicles(make, model, year, license_plate),
          workshop:workshops(name)
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Quotation type
      const transformedData = data?.map(item => ({
        ...item,
        items: Array.isArray(item.items) ? item.items : [],
        client: item.client ? { full_name: item.client.full_name } : undefined,
        vehicle: item.vehicle ? {
          make: item.vehicle.make,
          model: item.vehicle.model,
          year: item.vehicle.year,
          license_plate: item.vehicle.license_plate
        } : undefined,
        workshop: item.workshop ? { name: item.workshop.name } : undefined
      })) || [];

      setQuotations(transformedData);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quotations',
        variant: 'destructive',
      });
    }
  };

  const fetchTemplates = async () => {
    if (!profile?.tenant_id) return;
    
    try {
      const { data, error } = await supabase
        .from('quote_templates')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const createQuotation = async (quotationData: {
    client_id: string;
    workshop_id: string;
    vehicle_id?: string;
    appointment_id?: string;
    description?: string;
    items: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      item_type: string;
    }>;
    tax_rate?: number;
  }) => {
    if (!profile?.tenant_id) throw new Error('No tenant ID');

    try {
      // Generate quote number
      const { data: quoteNumber, error: numberError } = await supabase
        .rpc('generate_quote_number', { tenant_uuid: profile.tenant_id });

      if (numberError) throw numberError;

      // Create quotation
      const quotationInsert: TablesInsert<'quotations'> = {
        tenant_id: profile.tenant_id,
        client_id: quotationData.client_id,
        workshop_id: quotationData.workshop_id,
        vehicle_id: quotationData.vehicle_id,
        appointment_id: quotationData.appointment_id,
        description: quotationData.description,
        quote_number: quoteNumber,
        tax_rate: quotationData.tax_rate || 0,
        total_cost: 0, // Will be calculated by trigger
        status: 'pending',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };

      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .insert(quotationInsert)
        .select()
        .single();

      if (quotationError) throw quotationError;

      // Create quotation items
      const itemsToInsert = quotationData.items.map(item => ({
        quotation_id: quotation.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        item_type: item.item_type,
      }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      await fetchQuotations();
      
      toast({
        title: 'Quote Created',
        description: `Quote ${quoteNumber} has been created successfully.`,
      });

      return quotation;
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create quotation',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateQuotationStatus = async (id: string, status: string, approvedAt?: string) => {
    try {
      const updateData: any = { status };
      if (approvedAt) {
        updateData.approved_at = approvedAt;
      }

      const { error } = await supabase
        .from('quotations')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchQuotations();
      
      toast({
        title: 'Quote Updated',
        description: `Quote status changed to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quotation',
        variant: 'destructive',
      });
    }
  };

  const createTemplate = async (templateData: {
    name: string;
    service_type: string;
    description?: string;
    template_items: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      item_type: string;
    }>;
  }) => {
    if (!profile?.tenant_id || !profile?.id) throw new Error('Missing profile data');

    try {
      const { error } = await supabase
        .from('quote_templates')
        .insert({
          tenant_id: profile.tenant_id,
          created_by: profile.id,
          ...templateData,
        });

      if (error) throw error;

      await fetchTemplates();
      
      toast({
        title: 'Template Created',
        description: 'Quote template has been saved successfully.',
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create template',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (profile?.tenant_id) {
      setLoading(true);
      Promise.all([fetchQuotations(), fetchTemplates()]).finally(() => {
        setLoading(false);
      });
    }
  }, [profile?.tenant_id]);

  return {
    quotations,
    templates,
    loading,
    createQuotation,
    updateQuotationStatus,
    createTemplate,
    refetch: () => Promise.all([fetchQuotations(), fetchTemplates()]),
  };
};
