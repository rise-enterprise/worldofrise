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
import { UserX, AlertTriangle } from 'lucide-react';

interface RejectInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: {
    full_name: string;
    email: string;
  } | null;
  onReject: (reason: string) => void;
  isLoading: boolean;
}

export function RejectInvitationDialog({
  open,
  onOpenChange,
  request,
  onReject,
  isLoading,
}: RejectInvitationDialogProps) {
  const [reason, setReason] = useState('');

  const handleReject = () => {
    if (!reason.trim()) return;
    onReject(reason);
    setReason('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason('');
    }
    onOpenChange(newOpen);
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-destructive" />
            Reject Application
          </DialogTitle>
          <DialogDescription>
            This will reject {request.full_name}'s membership application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium text-foreground">{request.full_name}</p>
            <p className="text-sm text-muted-foreground">{request.email}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejection-reason">
              Reason for Rejection <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this application..."
              className="min-h-[100px] resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              This reason is for internal records only and will not be sent to the applicant.
            </p>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-amber-500/10 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p>
              Rejected applications can be reconsidered later from the "Can Reconsider" tab.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={isLoading || !reason.trim()}
            variant="destructive"
          >
            {isLoading ? 'Rejecting...' : 'Reject Application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
