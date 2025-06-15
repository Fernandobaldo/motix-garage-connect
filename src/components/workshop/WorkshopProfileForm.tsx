import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Clock, Globe, Save, Bell, Palette } from 'lucide-react';
import NotificationTemplateManager from '@/components/notifications/NotificationTemplateManager';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import BrandingManager from '@/components/workshop/BrandingManager';
import AddressFields from './AddressFields';
import { countries } from "@/utils/countries";

interface WorkshopProfileFormProps {
  formData: {
    name: string;
    address: string;
    phone: string;
    email: string;
    services_offered: string[];
    languages_spoken: string[];
    working_hours: any;
    is_public: boolean;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const availableServices = [
  'Oil Change',
  'Brake Service',
  'Engine Diagnostics',
  'Transmission Service',
  'Air Conditioning',
  'Tire Service',
  'Battery Service',
  'General Inspection',
  'Body Work',
  'Paint Service',
  'Electrical Service',
  'Suspension Service'
];

const availableLanguages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Arabic',
  'Russian'
];

const WorkshopProfileForm = ({
  formData,
  onFormDataChange,
  onSubmit,
  isSubmitting,
}: WorkshopProfileFormProps) => {
  const handleServiceChange = (service: string, checked: boolean) => {
    const newServices = checked 
      ? [...formData.services_offered, service]
      : formData.services_offered.filter(s => s !== service);
    
    onFormDataChange({ ...formData, services_offered: newServices });
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    const newLanguages = checked 
      ? [...formData.languages_spoken, language]
      : formData.languages_spoken.filter(l => l !== language);
    
    onFormDataChange({ ...formData, languages_spoken: newLanguages });
  };

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    const newWorkingHours = {
      ...formData.working_hours,
      [day]: {
        ...formData.working_hours[day],
        [field]: value
      }
    };
    onFormDataChange({ ...formData, working_hours: newWorkingHours });
  };

  // For initial load, convert legacy string to object (for backward compat)
  const handleAddressChange = (address: any) => {
    onFormDataChange({ ...formData, address });
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile" className="flex items-center space-x-2">
          <Building className="h-4 w-4" />
          <span>Profile</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center space-x-2">
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="templates" className="flex items-center space-x-2">
          <Bell className="h-4 w-4" />
          <span>Templates</span>
        </TabsTrigger>
        <TabsTrigger value="branding" className="flex items-center space-x-2">
          <Palette className="h-4 w-4" />
          <span>Branding</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Configure your workshop's basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Workshop Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      onFormDataChange({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter workshop name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      onFormDataChange({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div>
                <Label>Workshop Address</Label>
                <div className="mt-2">
                  <AddressFields
                    address={formData.address}
                    onAddressChange={handleAddressChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Services Offered */}
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
              <CardDescription>
                Select the services your workshop provides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableServices.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={formData.services_offered.includes(service)}
                      onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                    />
                    <Label htmlFor={service} className="text-sm font-normal">
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages Spoken */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Languages Spoken</span>
              </CardTitle>
              <CardDescription>
                Select the languages your team speaks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableLanguages.map((language) => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox
                      id={language}
                      checked={formData.languages_spoken.includes(language)}
                      onCheckedChange={(checked) => handleLanguageChange(language, checked as boolean)}
                    />
                    <Label htmlFor={language} className="text-sm font-normal">
                      {language}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Working Hours</span>
              </CardTitle>
              <CardDescription>
                Set your workshop's operating hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {days.map((day) => (
                  <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <Label className="capitalize font-medium">{day}</Label>
                    <div>
                      <Label htmlFor={`${day}-open`} className="text-sm text-gray-600">Open</Label>
                      <Input
                        id={`${day}-open`}
                        type="time"
                        value={formData.working_hours[day]?.open || ''}
                        onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${day}-close`} className="text-sm text-gray-600">Close</Label>
                      <Input
                        id={`${day}-close`}
                        type="time"
                        value={formData.working_hours[day]?.close || ''}
                        onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${day}-closed`}
                        checked={formData.working_hours[day]?.closed || false}
                        onCheckedChange={(checked) => handleWorkingHoursChange(day, 'closed', checked as boolean)}
                      />
                      <Label htmlFor={`${day}-closed`} className="text-sm">Closed</Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Public Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>
                Make your workshop discoverable by clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => onFormDataChange({ ...formData, is_public: checked })}
                />
                <Label htmlFor="is_public">
                  Make workshop profile public for client discovery
                </Label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                When enabled, clients will be able to find and book appointments with your workshop
              </p>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Workshop Profile'}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationPreferences />
      </TabsContent>

      <TabsContent value="templates">
        <NotificationTemplateManager />
      </TabsContent>

      <TabsContent value="branding">
        <BrandingManager />
      </TabsContent>
    </Tabs>
  );
};

export default WorkshopProfileForm;
