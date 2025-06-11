
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Bell, Mail, MessageSquare, Settings } from 'lucide-react';

interface NotificationPreferences {
  id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  email_service: string;
  sms_service: string;
  reminder_24h_enabled: boolean;
  reminder_2h_enabled: boolean;
}

const NotificationPreferences = () => {
  const { profile } = useAuth();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: fetchedPreferences } = useQuery({
    queryKey: ['notification-preferences', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('tenant_id', tenant.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      return data;
    },
    enabled: !!tenant?.id,
  });

  useEffect(() => {
    if (fetchedPreferences) {
      setPreferences(fetchedPreferences);
    } else if (tenant?.id) {
      // Create default preferences if none exist
      const defaultPrefs = {
        id: '',
        email_enabled: true,
        sms_enabled: false,
        email_service: 'resend',
        sms_service: 'twilio',
        reminder_24h_enabled: true,
        reminder_2h_enabled: true,
      };
      setPreferences(defaultPrefs);
    }
    setIsLoading(false);
  }, [fetchedPreferences, tenant?.id]);

  const handleSave = async () => {
    if (!preferences || !tenant?.id) return;

    try {
      setIsLoading(true);
      
      const preferencesData = {
        tenant_id: tenant.id,
        email_enabled: preferences.email_enabled,
        sms_enabled: preferences.sms_enabled,
        email_service: preferences.email_service,
        sms_service: preferences.sms_service,
        reminder_24h_enabled: preferences.reminder_24h_enabled,
        reminder_2h_enabled: preferences.reminder_2h_enabled,
      };

      if (fetchedPreferences?.id) {
        // Update existing preferences
        const { error } = await supabase
          .from('notification_preferences')
          .update(preferencesData)
          .eq('id', fetchedPreferences.id);
        
        if (error) throw error;
      } else {
        // Create new preferences
        const { error } = await supabase
          .from('notification_preferences')
          .insert(preferencesData);
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({ title: 'Notification preferences saved successfully' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  if (profile?.role !== 'workshop') {
    return <div>Access denied. Workshop role required.</div>;
  }

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  if (!preferences) {
    return <div>Error loading preferences</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Bell className="h-6 w-6 mr-2" />
          Notification Preferences
        </h2>
        <p className="text-gray-600">Configure how and when to send notifications to clients</p>
      </div>

      <div className="grid gap-6">
        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Configure email notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                <p className="text-sm text-gray-600">Send appointment updates via email</p>
              </div>
              <Switch
                id="email-enabled"
                checked={preferences.email_enabled}
                onCheckedChange={(checked) => updatePreference('email_enabled', checked)}
              />
            </div>

            {preferences.email_enabled && (
              <div>
                <Label htmlFor="email-service">Email Service Provider</Label>
                <Select
                  value={preferences.email_service}
                  onValueChange={(value) => updatePreference('email_service', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resend">Resend</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Make sure to configure your API keys in Supabase secrets
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMS Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              SMS Notifications
            </CardTitle>
            <CardDescription>
              Configure SMS notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
                <p className="text-sm text-gray-600">Send appointment updates via SMS</p>
              </div>
              <Switch
                id="sms-enabled"
                checked={preferences.sms_enabled}
                onCheckedChange={(checked) => updatePreference('sms_enabled', checked)}
              />
            </div>

            {preferences.sms_enabled && (
              <div>
                <Label htmlFor="sms-service">SMS Service Provider</Label>
                <Select
                  value={preferences.sms_service}
                  onValueChange={(value) => updatePreference('sms_service', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Make sure to configure your Twilio API keys in Supabase secrets
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminder Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Reminder Settings
            </CardTitle>
            <CardDescription>
              Configure when to send appointment reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reminder-24h">24 Hour Reminder</Label>
                <p className="text-sm text-gray-600">Send reminder 24 hours before appointment</p>
              </div>
              <Switch
                id="reminder-24h"
                checked={preferences.reminder_24h_enabled}
                onCheckedChange={(checked) => updatePreference('reminder_24h_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reminder-2h">2 Hour Reminder</Label>
                <p className="text-sm text-gray-600">Send reminder 2 hours before appointment</p>
              </div>
              <Switch
                id="reminder-2h"
                checked={preferences.reminder_2h_enabled}
                onCheckedChange={(checked) => updatePreference('reminder_2h_enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
