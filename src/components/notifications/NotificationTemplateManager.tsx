
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Mail, MessageSquare, Plus, Edit, Eye } from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  trigger_event: string;
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
}

const triggerEvents = [
  { value: 'appointment_confirmed', label: 'Appointment Confirmed' },
  { value: 'appointment_reminder_24h', label: '24 Hour Reminder' },
  { value: 'appointment_reminder_2h', label: '2 Hour Reminder' },
  { value: 'appointment_in_progress', label: 'Appointment In Progress' },
  { value: 'appointment_completed', label: 'Appointment Completed' },
  { value: 'appointment_cancelled', label: 'Appointment Cancelled' },
  { value: 'vehicle_ready', label: 'Vehicle Ready' },
];

const NotificationTemplateManager = () => {
  const { profile } = useAuth();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms',
    trigger_event: '',
    subject: '',
    content: '',
    is_active: true,
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['notification-templates', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NotificationTemplate[];
    },
    enabled: !!tenant?.id,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'email',
      trigger_event: '',
      subject: '',
      content: '',
      is_active: true,
    });
    setEditingTemplate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenant?.id) return;

    try {
      const templateData = {
        ...formData,
        tenant_id: tenant.id,
        variables: getAvailableVariables(),
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('notification_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
        toast({ title: 'Template updated successfully' });
      } else {
        const { error } = await supabase
          .from('notification_templates')
          .insert(templateData);
        
        if (error) throw error;
        toast({ title: 'Template created successfully' });
      }

      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleTemplateStatus = async (template: NotificationTemplate) => {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast({ 
        title: `Template ${!template.is_active ? 'activated' : 'deactivated'}` 
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getAvailableVariables = (): string[] => {
    const commonVars = ['client_name', 'workshop_name', 'workshop_phone', 'service_type'];
    const appointmentVars = ['appointment_date', 'appointment_time', 'workshop_address'];
    const vehicleVars = ['vehicle_info'];
    const costVars = ['total_cost'];
    
    return [...commonVars, ...appointmentVars, ...vehicleVars, ...costVars];
  };

  const getPreviewContent = (template: NotificationTemplate) => {
    let content = template.content;
    let subject = template.subject;
    
    const sampleVars = {
      client_name: 'John Doe',
      workshop_name: 'Best Auto Repair',
      workshop_phone: '(555) 123-4567',
      workshop_address: '123 Main St, City, State',
      service_type: 'Oil Change',
      appointment_date: '2024-06-15',
      appointment_time: '10:00 AM',
      vehicle_info: '2020 Toyota Camry',
      total_cost: '$89.99',
    };

    Object.entries(sampleVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
      if (subject) {
        subject = subject.replace(regex, value);
      }
    });

    return { content, subject };
  };

  if (profile?.role !== 'workshop') {
    return <div>Access denied. Workshop role required.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Templates</h2>
          <p className="text-gray-600">Manage automated email and SMS notifications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
              <DialogDescription>
                Create custom notification templates with dynamic variables
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Appointment Confirmation"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'email' | 'sms') => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="trigger_event">Trigger Event</Label>
                <Select
                  value={formData.trigger_event}
                  onValueChange={(value) => setFormData({ ...formData, trigger_event: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select when to send this notification" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerEvents.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'email' && (
                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Appointment Confirmed - {{workshop_name}}"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Dear {{client_name}}, your {{service_type}} appointment..."
                  rows={6}
                  required
                />
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Available variables:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getAvailableVariables().map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTemplate ? 'Update' : 'Create'} Template
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading templates...</div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {template.type === 'email' ? (
                      <Mail className="h-5 w-5 text-blue-600" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>
                        {triggerEvents.find(e => e.value === template.trigger_event)?.label}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTemplate(template);
                        setFormData({
                          name: template.name,
                          type: template.type,
                          trigger_event: template.trigger_event,
                          subject: template.subject || '',
                          content: template.content,
                          is_active: template.is_active,
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={() => toggleTemplateStatus(template)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview with sample data
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              {previewTemplate.subject && (
                <div>
                  <Label>Subject:</Label>
                  <div className="p-3 bg-gray-50 rounded border">
                    {getPreviewContent(previewTemplate).subject}
                  </div>
                </div>
              )}
              <div>
                <Label>Content:</Label>
                <div className="p-3 bg-gray-50 rounded border whitespace-pre-wrap">
                  {getPreviewContent(previewTemplate).content}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationTemplateManager;
