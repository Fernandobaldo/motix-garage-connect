
-- Create notification templates table
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
  trigger_event TEXT NOT NULL CHECK (trigger_event IN ('appointment_confirmed', 'appointment_reminder_24h', 'appointment_reminder_2h', 'appointment_in_progress', 'appointment_completed', 'appointment_cancelled', 'vehicle_ready')),
  subject TEXT, -- Only for email templates
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Available variables for this template
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  email_service TEXT DEFAULT 'resend' CHECK (email_service IN ('resend', 'sendgrid')),
  sms_service TEXT DEFAULT 'twilio' CHECK (sms_service IN ('twilio')),
  reminder_24h_enabled BOOLEAN DEFAULT true,
  reminder_2h_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add branding columns to workshops table
ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3B82F6';
ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1E40AF';
ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#F59E0B';

-- Enable RLS on new tables
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_templates
CREATE POLICY "Users can view templates for their tenant" 
  ON public.notification_templates 
  FOR SELECT 
  USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Workshop users can manage templates for their tenant" 
  ON public.notification_templates 
  FOR ALL
  USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'workshop');

-- RLS policies for notification_preferences
CREATE POLICY "Users can view preferences for their tenant" 
  ON public.notification_preferences 
  FOR SELECT 
  USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Workshop users can manage preferences for their tenant" 
  ON public.notification_preferences 
  FOR ALL
  USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'workshop');

-- Create default notification templates function
CREATE OR REPLACE FUNCTION public.create_default_notification_templates(workshop_tenant_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert default email templates
  INSERT INTO public.notification_templates (tenant_id, name, type, trigger_event, subject, content, variables) VALUES
  (workshop_tenant_id, 'Appointment Confirmation Email', 'email', 'appointment_confirmed', 
   'Appointment Confirmed - {{workshop_name}}', 
   'Dear {{client_name}},\n\nYour {{service_type}} appointment has been confirmed for {{appointment_date}} at {{appointment_time}}.\n\nWorkshop: {{workshop_name}}\nAddress: {{workshop_address}}\nPhone: {{workshop_phone}}\n\nThank you for choosing us!', 
   '["client_name", "workshop_name", "workshop_address", "workshop_phone", "service_type", "appointment_date", "appointment_time"]'::jsonb),
   
  (workshop_tenant_id, '24 Hour Reminder Email', 'email', 'appointment_reminder_24h',
   'Appointment Reminder - Tomorrow at {{workshop_name}}',
   'Dear {{client_name}},\n\nThis is a reminder that you have a {{service_type}} appointment tomorrow at {{appointment_time}}.\n\nWorkshop: {{workshop_name}}\nAddress: {{workshop_address}}\n\nSee you tomorrow!',
   '["client_name", "workshop_name", "workshop_address", "service_type", "appointment_time"]'::jsonb),
   
  (workshop_tenant_id, 'Vehicle Ready Notification', 'email', 'vehicle_ready',
   'Your Vehicle is Ready - {{workshop_name}}',
   'Dear {{client_name}},\n\nGreat news! Your {{vehicle_info}} is ready for pickup.\n\nService completed: {{service_type}}\nTotal cost: {{total_cost}}\n\nPlease contact us to arrange pickup.\n\nWorkshop: {{workshop_name}}\nPhone: {{workshop_phone}}',
   '["client_name", "vehicle_info", "service_type", "total_cost", "workshop_name", "workshop_phone"]'::jsonb);

  -- Insert default SMS templates
  INSERT INTO public.notification_templates (tenant_id, name, type, trigger_event, content, variables) VALUES
  (workshop_tenant_id, 'Appointment Confirmation SMS', 'sms', 'appointment_confirmed',
   'Hi {{client_name}}! Your {{service_type}} appointment is confirmed for {{appointment_date}} at {{appointment_time}}. {{workshop_name}} - {{workshop_phone}}',
   '["client_name", "service_type", "appointment_date", "appointment_time", "workshop_name", "workshop_phone"]'::jsonb),
   
  (workshop_tenant_id, '2 Hour Reminder SMS', 'sms', 'appointment_reminder_2h',
   'Reminder: Your {{service_type}} appointment is in 2 hours at {{workshop_name}}. {{workshop_address}}',
   '["service_type", "workshop_name", "workshop_address"]'::jsonb),
   
  (workshop_tenant_id, 'Vehicle Ready SMS', 'sms', 'vehicle_ready',
   'Your {{vehicle_info}} is ready for pickup! {{service_type}} completed. Total: {{total_cost}}. Call {{workshop_phone}} to arrange pickup.',
   '["vehicle_info", "service_type", "total_cost", "workshop_phone"]'::jsonb);

  -- Insert default notification preferences
  INSERT INTO public.notification_preferences (tenant_id) VALUES (workshop_tenant_id);
END;
$$;

-- Create trigger to auto-create default templates for new workshops
CREATE OR REPLACE FUNCTION public.setup_workshop_notifications()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create default notification templates and preferences for new workshop
  PERFORM create_default_notification_templates(NEW.tenant_id);
  RETURN NEW;
END;
$$;

-- Create trigger on workshops table
DROP TRIGGER IF EXISTS setup_workshop_notifications_trigger ON public.workshops;
CREATE TRIGGER setup_workshop_notifications_trigger
  AFTER INSERT ON public.workshops
  FOR EACH ROW
  EXECUTE FUNCTION setup_workshop_notifications();

-- Create storage bucket for workshop logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('workshop-logos', 'workshop-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for workshop logos
CREATE POLICY "Users can view workshop logos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'workshop-logos');

CREATE POLICY "Workshop users can upload logos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'workshop-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Workshop users can update their logos" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'workshop-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Workshop users can delete their logos" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'workshop-logos' AND auth.role() = 'authenticated');
