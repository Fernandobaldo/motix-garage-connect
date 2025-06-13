
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Shield } from 'lucide-react';

interface BlockConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  workshopName: string;
  isBlocking: boolean;
  isLoading: boolean;
}

const BlockConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  workshopName,
  isBlocking,
  isLoading,
}: BlockConfirmationModalProps) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBlocking ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Shield className="h-5 w-5 text-green-500" />
            )}
            {isBlocking ? 'Block Workshop' : 'Unblock Workshop'}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {isBlocking ? 'block' : 'unblock'} "{workshopName}"?
            {isBlocking && ' This will prevent the workshop from accessing their account.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder={`Enter reason for ${isBlocking ? 'blocking' : 'unblocking'} this workshop...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isBlocking ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isBlocking ? 'Block Workshop' : 'Unblock Workshop')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlockConfirmationModal;
