import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Phone, Sparkles } from 'lucide-react';

interface ConfirmInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: {
    full_name: string;
    email: string;
    phone?: string | null;
    preferred_brand?: string | null;
    message?: string | null;
  } | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function ConfirmInvitationDialog({
  open,
  onOpenChange,
  request,
  onConfirm,
  isLoading,
}: ConfirmInvitationDialogProps) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-500" />
            Confirm Membership
          </DialogTitle>
          <DialogDescription>
            This will add the applicant as a new member to the loyalty program.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{request.full_name}</span>
              {request.preferred_brand && (
                <Badge variant="outline" className="capitalize">
                  {request.preferred_brand}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {request.email}
            </div>
            {request.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {request.phone}
              </div>
            )}
            {request.message && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground italic">"{request.message}"</p>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-green-500/10 rounded-lg p-3">
            <Sparkles className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <p>
              The applicant will be added to the members database and can begin their
              loyalty journey.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? 'Adding...' : 'Confirm & Add Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
