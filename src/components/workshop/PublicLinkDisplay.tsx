
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PublicLink {
  link_id: string;
  slug: string;
  public_url: string;
}

interface PublicLinkDisplayProps {
  publicLink: PublicLink;
}

const PublicLinkDisplay = ({ publicLink }: PublicLinkDisplayProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
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
    window.open(publicLink.public_url, '_blank');
  };

  return (
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
  );
};

export default PublicLinkDisplay;
