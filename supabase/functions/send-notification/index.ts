
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  appointmentId: string;
  triggerEvent: string;
  recipientPhone?: string;
  recipientEmail?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId, triggerEvent, recipientPhone, recipientEmail }: NotificationRequest = await req.json();

    console.log('Processing notification:', { appointmentId, triggerEvent });

    // Get appointment details with related data
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        client:profiles!appointments_client_id_fkey(id, full_name, phone),
        workshop:workshops!appointments_workshop_id_fkey(id, name, phone, email, address),
        vehicle:vehicles!appointments_vehicle_id_fkey(id, make, model, year, license_plate)
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found');
    }

    // Get notification preferences for the workshop
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('tenant_id', appointment.tenant_id)
      .single();

    if (!preferences) {
      console.log('No notification preferences found for tenant');
      return new Response(JSON.stringify({ success: true, message: 'No preferences configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get notification templates for this trigger event
    const { data: templates } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('tenant_id', appointment.tenant_id)
      .eq('trigger_event', triggerEvent)
      .eq('is_active', true);

    if (!templates || templates.length === 0) {
      console.log('No active templates found for trigger event:', triggerEvent);
      return new Response(JSON.stringify({ success: true, message: 'No templates configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare template variables
    const appointmentDate = new Date(appointment.scheduled_at).toLocaleDateString();
    const appointmentTime = new Date(appointment.scheduled_at).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const variables = {
      client_name: appointment.client?.full_name || 'Valued Customer',
      workshop_name: appointment.workshop?.name || 'Workshop',
      workshop_address: appointment.workshop?.address || '',
      workshop_phone: appointment.workshop?.phone || '',
      service_type: appointment.service_type,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      vehicle_info: appointment.vehicle ? 
        `${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}` : 
        'Vehicle',
      total_cost: 'TBD' // This would come from quotation in real scenario
    };

    const results = [];

    for (const template of templates) {
      let processedContent = template.content;
      let processedSubject = template.subject;

      // Replace variables in content and subject
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processedContent = processedContent.replace(regex, value);
        if (processedSubject) {
          processedSubject = processedSubject.replace(regex, value);
        }
      });

      if (template.type === 'email' && preferences.email_enabled) {
        const emailTo = recipientEmail || appointment.client?.email || 'client@example.com';
        
        try {
          const emailResult = await resend.emails.send({
            from: 'Workshop <notifications@resend.dev>',
            to: [emailTo],
            subject: processedSubject || 'Workshop Notification',
            html: processedContent.replace(/\n/g, '<br>'),
          });
          
          results.push({ type: 'email', success: true, result: emailResult });
          console.log('Email sent successfully:', emailResult);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          results.push({ type: 'email', success: false, error: emailError.message });
        }
      }

      if (template.type === 'sms' && preferences.sms_enabled) {
        // SMS implementation would go here (Twilio integration)
        // For now, just log the SMS content
        const phoneNumber = recipientPhone || appointment.client?.phone;
        console.log('SMS would be sent to:', phoneNumber);
        console.log('SMS content:', processedContent);
        results.push({ 
          type: 'sms', 
          success: true, 
          message: 'SMS simulation (Twilio integration needed)',
          content: processedContent,
          phone: phoneNumber
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      processedVariables: variables 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-notification function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
