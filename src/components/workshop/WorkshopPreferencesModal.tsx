
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, DollarSign, Ruler, Clock } from 'lucide-react';
import { useWorkshopPreferences } from '@/hooks/useWorkshopPreferences';
import { CURRENCIES } from '@/utils/currency';

interface WorkshopPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkshopPreferencesModal = ({ isOpen, onClose }: WorkshopPreferencesModalProps) => {
  const { preferences, updatePreferences, isUpdating } = useWorkshopPreferences();
  const [formData, setFormData] = useState({
    currency_code: 'USD',
    distance_unit: 'km',
    timezone: 'UTC',
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        currency_code: preferences.currency_code || 'USD',
        distance_unit: preferences.distance_unit || 'km',
        timezone: preferences.timezone || 'UTC',
      });
    }
  }, [preferences]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences(formData);
    onClose();
  };

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Workshop Preferences
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            {/* Currency Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  Currency Settings
                </CardTitle>
                <CardDescription>
                  Choose your preferred currency for displaying costs and pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={formData.currency_code}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, currency_code: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CURRENCIES).map(([code, info]) => (
                        <SelectItem key={code} value={code}>
                          {info.symbol} {info.name} ({code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Distance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ruler className="h-5 w-5" />
                  Distance Unit
                </CardTitle>
                <CardDescription>
                  Choose between kilometers and miles for distance measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="distance_unit">Distance Unit</Label>
                  <Select
                    value={formData.distance_unit}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, distance_unit: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">Kilometers (km)</SelectItem>
                      <SelectItem value="miles">Miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Timezone Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Timezone
                </CardTitle>
                <CardDescription>
                  Set your workshop's timezone for appointments and scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkshopPreferencesModal;
