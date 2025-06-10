
-- Add foreign key constraint between quotation_items and quotations
ALTER TABLE public.quotation_items 
ADD CONSTRAINT quotation_items_quotation_id_fkey 
FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;

-- Also add an index for better performance on the foreign key
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON public.quotation_items(quotation_id);
