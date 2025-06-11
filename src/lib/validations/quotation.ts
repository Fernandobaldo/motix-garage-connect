
import { z } from 'zod';

export const quotationItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  quantity: z.number().min(0.1, 'Quantity must be greater than 0').max(9999, 'Quantity too large'),
  unit_price: z.number().min(0, 'Price cannot be negative').max(999999, 'Price too large'),
  item_type: z.enum(['service', 'part', 'labor'], {
    errorMap: () => ({ message: 'Please select a valid item type' })
  }),
});

export const quotationFormSchema = z.object({
  client_id: z.string().min(1, 'Please select a client'),
  workshop_id: z.string().min(1, 'Please select a workshop'),
  vehicle_id: z.string().min(1, 'Please select a vehicle'),
  appointment_id: z.string().optional(),
  description: z.string().max(500, 'Description too long').optional(),
  tax_rate: z.number().min(0, 'Tax rate cannot be negative').max(1, 'Tax rate cannot exceed 100%').default(0.13),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
});

export type QuotationFormData = z.infer<typeof quotationFormSchema>;
export type QuotationItemData = z.infer<typeof quotationItemSchema>;
