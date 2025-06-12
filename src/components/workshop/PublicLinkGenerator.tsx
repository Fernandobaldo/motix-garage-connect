
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PublicLink {
  link_id: string;
  slug: string;
  public_url: string;
}

interface PublicLinkGeneratorProps {
  onLinkGenerated: (link: PublicLink) => void;
}

const PublicLinkGenerator = ({ onLinkGenerated }: PublicLinkGeneratorProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customSlug, setCustomSlug] = useState('');

  const generatePublicLink = async () => {
    if (!profile?.tenant_id) return;

    setLoading(true);

    try {
      const { data: workshops } = await supabase
        .from('workshops')
        .select('id')
        .eq('owner_id', profile.id)
        .single();

      if (!workshops) {
        throw new Error('Workshop not found');
      }

      const { data, error } = await supabase
        .rpc('generate_workshop_public_link', {
          p_workshop_id: workshops.id,
          p_custom_slug: customSlug || null
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const newLink = data[0];
        onLinkGenerated({
          link_id: newLink.id,
          slug: newLink.slug,
          public_url: `/book/${newLink.slug}`
        });
        
        toast({
          title: 'Public Link Generated',
          description: 'Your public booking link has been created successfully!',
        });
      }
    } catch (error: any) {
      console.error('Error generating public link:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate public link',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="custom_slug">Custom Slug (Optional)</Label>
        <Input
          id="custom_slug"
          value={customSlug}
          onChange={(e) => setCustomSlug(e.target.value)}
          placeholder="e.g., my-workshop"
          className="max-w-sm"
        />
        <p className="text-sm text-gray-500">
          Leave empty to auto-generate based on your workshop name
        </p>
      </div>

      <Button
        onClick={generatePublicLink}
        disabled={loading}
        className="flex items-center space-x-2"
      >
        <Settings className="h-4 w-4" />
        <span>{loading ? 'Generating...' : 'Generate Public Link'}</span>
      </Button>
    </div>
  );
};

export default PublicLinkGenerator;
