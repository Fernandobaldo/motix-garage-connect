
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import PublicLinkDisplay from './PublicLinkDisplay';
import PublicLinkGenerator from './PublicLinkGenerator';

interface PublicLink {
  link_id: string;
  slug: string;
  public_url: string;
}

const PublicLinkManager = () => {
  const { profile } = useAuth();
  const [publicLink, setPublicLink] = useState<PublicLink | null>(null);

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

  const handleLinkGenerated = (newLink: PublicLink) => {
    setPublicLink(newLink);
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
          <PublicLinkDisplay publicLink={publicLink} />
        ) : (
          <PublicLinkGenerator onLinkGenerated={handleLinkGenerated} />
        )}
      </CardContent>
    </Card>
  );
};

export default PublicLinkManager;
