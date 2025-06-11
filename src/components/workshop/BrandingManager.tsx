
import { useState, useRef } from 'react';
import { useWorkshop } from '@/hooks/useWorkshop';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Palette, Upload, Image } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BrandingManager = () => {
  const { profile } = useAuth();
  const { workshop, updateWorkshop } = useWorkshop();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [brandingData, setBrandingData] = useState({
    primary_color: workshop?.primary_color || '#3B82F6',
    secondary_color: workshop?.secondary_color || '#1E40AF',
    accent_color: workshop?.accent_color || '#F59E0B',
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !workshop) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${workshop.id}/logo.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('workshop-logos')
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('workshop-logos')
        .getPublicUrl(fileName);

      // Update workshop with logo URL
      await updateWorkshop({
        logo_url: publicUrl,
      });

      toast({
        title: 'Success',
        description: 'Logo uploaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleColorUpdate = async () => {
    if (!workshop) return;

    setIsUpdating(true);

    try {
      await updateWorkshop(brandingData);
      
      toast({
        title: 'Success',
        description: 'Brand colors updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const resetColors = () => {
    setBrandingData({
      primary_color: '#3B82F6',
      secondary_color: '#1E40AF',
      accent_color: '#F59E0B',
    });
  };

  if (profile?.role !== 'workshop') {
    return <div>Access denied. Workshop role required.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Palette className="h-6 w-6 mr-2" />
          Brand Personalization
        </h2>
        <p className="text-gray-600">Customize your workshop's branding for quotations and communications</p>
      </div>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="h-5 w-5 mr-2" />
            Workshop Logo
          </CardTitle>
          <CardDescription>
            Upload your workshop logo (max 2MB, PNG/JPG/JPEG)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workshop?.logo_url && (
            <div className="flex items-center space-x-4">
              <img 
                src={workshop.logo_url} 
                alt="Workshop Logo" 
                className="h-16 w-16 object-contain border rounded"
              />
              <div>
                <p className="text-sm font-medium">Current Logo</p>
                <p className="text-xs text-gray-500">Click upload to replace</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Logo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card>
        <CardHeader>
          <CardTitle>Color Scheme</CardTitle>
          <CardDescription>
            Customize your brand colors for quotations and documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center space-x-3 mt-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={brandingData.primary_color}
                  onChange={(e) => setBrandingData({ 
                    ...brandingData, 
                    primary_color: e.target.value 
                  })}
                  className="w-16 h-10 p-1 border border-gray-300 rounded"
                />
                <Input
                  value={brandingData.primary_color}
                  onChange={(e) => setBrandingData({ 
                    ...brandingData, 
                    primary_color: e.target.value 
                  })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Used for headers and main elements</p>
            </div>

            <div>
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex items-center space-x-3 mt-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={brandingData.secondary_color}
                  onChange={(e) => setBrandingData({ 
                    ...brandingData, 
                    secondary_color: e.target.value 
                  })}
                  className="w-16 h-10 p-1 border border-gray-300 rounded"
                />
                <Input
                  value={brandingData.secondary_color}
                  onChange={(e) => setBrandingData({ 
                    ...brandingData, 
                    secondary_color: e.target.value 
                  })}
                  placeholder="#1E40AF"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Used for backgrounds and sections</p>
            </div>

            <div>
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex items-center space-x-3 mt-2">
                <Input
                  id="accent-color"
                  type="color"
                  value={brandingData.accent_color}
                  onChange={(e) => setBrandingData({ 
                    ...brandingData, 
                    accent_color: e.target.value 
                  })}
                  className="w-16 h-10 p-1 border border-gray-300 rounded"
                />
                <Input
                  value={brandingData.accent_color}
                  onChange={(e) => setBrandingData({ 
                    ...brandingData, 
                    accent_color: e.target.value 
                  })}
                  placeholder="#F59E0B"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Used for highlights and CTAs</p>
            </div>
          </div>

          {/* Color Preview */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Preview</h4>
            <div className="space-y-3">
              <div 
                className="h-12 rounded flex items-center px-4 text-white font-medium"
                style={{ backgroundColor: brandingData.primary_color }}
              >
                Primary Color - Header Example
              </div>
              <div 
                className="h-10 rounded flex items-center px-4 text-white"
                style={{ backgroundColor: brandingData.secondary_color }}
              >
                Secondary Color - Section Background
              </div>
              <div 
                className="h-8 rounded flex items-center px-3 text-white text-sm"
                style={{ backgroundColor: brandingData.accent_color }}
              >
                Accent Color - Button/Highlight
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={resetColors}
            >
              Reset to Default
            </Button>
            <Button
              onClick={handleColorUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Save Colors'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandingManager;
