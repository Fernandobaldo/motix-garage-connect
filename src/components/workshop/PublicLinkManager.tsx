
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, Settings, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PublicLink {
  link_id: string;
  slug: string;
  public_url: string;
}

const PublicLinkManager = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [publicLink, setPublicLink] = useState<PublicLink | null>(null);
  const [customSlug, setCustomSlug] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile?.tenant_id) {
      checkExistingLink();
    }
  }, [profile]);

  const checkExistingLink = async () => {
    try {
      const { data: workshops } = await supabase
        .from('workshops')
        .select('id')
        .eq('owner_id', profile?.id)
        .single();

      if (workshops) {
        const { data: links } = await supabase
          .from('workshop_public_links')
          .select('*')
          .eq('workshop_id', workshops.id)
          .single();

        if (links) {
          setPublicLink({
            link_id: links.id,
            slug: links.slug,
            public_url: `/book/${links.slug}`
          });
        }
      }
    } catch (error) {
      console.error('Error checking existing link:', error);
    }
  };

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
        setPublicLink(data[0]);
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

  const copyToClipboard = async () => {
    if (!publicLink) return;

    const fullUrl = `${window.location.origin}${publicLink.public_url}`;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({
        title: 'Link Copied',
        description: 'The booking link has been copied to your clipboard',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy link to clipboard',
        variant: 'destructive'
      });
    }
  };

  const openBookingPage = () => {
    if (!publicLink) return;
    window.open(publicLink.public_url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ExternalLink className="h-5 w-5" />
          <span>Public Booking Link</span>
        </CardTitle>
        <CardDescription>
          Generate a public booking link that clients can use to schedule appointments directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {publicLink ? (
          <div className="space-y-4">
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                Your public booking link is active and ready to use!
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Your Public Booking Link</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={`${window.location.origin}${publicLink.public_url}`}
                  readOnly
                  className="bg-gray-50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openBookingPage}
                  className="flex items-center space-x-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Preview</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link Details</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Slug: {publicLink.slug}</Badge>
                <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Share this link with your clients so they can book appointments directly. 
                The link will remain active until you deactivate it.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default PublicLinkManager;
