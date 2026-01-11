import { memo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RotateCcw, Loader2 } from 'lucide-react';

interface RevertConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Version number being reverted to */
  versionNumber: number;
  /** Callback when user confirms the revert */
  onConfirm: () => void;
  /** Callback when user cancels the revert */
  onCancel: () => void;
  /** Whether a revert operation is in progress */
  isReverting: boolean;
}

/**
 * Confirmation dialog for reverting to a previous version.
 *
 * Reassures the user that their current changes will be saved
 * as a new version before reverting, so nothing is lost.
 */
export const RevertConfirmDialog = memo(function RevertConfirmDialog({
  open,
  onOpenChange,
  versionNumber,
  onConfirm,
  onCancel,
  isReverting,
}: RevertConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revert to Version {versionNumber}?</AlertDialogTitle>
          <AlertDialogDescription>
            Your current changes will be saved as a new version before reverting.
            You can always restore them later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isReverting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isReverting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isReverting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reverting...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Revert
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
