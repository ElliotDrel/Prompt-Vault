import { useState, useCallback } from 'react';
import { Prompt, PromptVersion } from '@/types/prompt';
import { usePrompts } from '@/contexts/PromptsContext';
import toast from 'react-hot-toast';

interface UseRevertToVersionOptions {
  /** The ID of the prompt being reverted */
  promptId: string;
  /** The current prompt state (for auto-save before revert) */
  currentPrompt: Prompt;
  /** Optional callback when revert completes successfully */
  onSuccess?: () => void;
}

interface UseRevertToVersionReturn {
  /** Whether a revert operation is in progress */
  isReverting: boolean;
  /** The version awaiting user confirmation (null if no pending revert) */
  pendingVersion: PromptVersion | null;
  /** Request revert to a specific version (triggers confirmation dialog) */
  requestRevert: (version: PromptVersion) => void;
  /** Execute the revert after user confirmation */
  confirmRevert: () => Promise<void>;
  /** Cancel the pending revert */
  cancelRevert: () => void;
}

/**
 * Hook for managing the revert-to-version workflow.
 *
 * Features:
 * - Auto-saves current prompt state before reverting (ensures no data loss)
 * - Provides pendingVersion state for confirmation dialog
 * - Handles loading states and error toasts
 *
 * Usage:
 * ```tsx
 * const { isReverting, pendingVersion, requestRevert, confirmRevert, cancelRevert } =
 *   useRevertToVersion({ promptId, currentPrompt, onSuccess });
 *
 * // When user clicks revert button:
 * requestRevert(selectedVersion);
 *
 * // In confirmation dialog:
 * <RevertConfirmDialog
 *   open={!!pendingVersion}
 *   onOpenChange={(open) => !open && cancelRevert()}
 *   versionNumber={pendingVersion?.versionNumber ?? 0}
 *   onConfirm={confirmRevert}
 *   onCancel={cancelRevert}
 *   isReverting={isReverting}
 * />
 * ```
 */
export function useRevertToVersion({
  promptId,
  currentPrompt,
  onSuccess,
}: UseRevertToVersionOptions): UseRevertToVersionReturn {
  const { updatePrompt } = usePrompts();
  const [isReverting, setIsReverting] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<PromptVersion | null>(null);

  const requestRevert = useCallback((version: PromptVersion) => {
    setPendingVersion(version);
  }, []);

  const cancelRevert = useCallback(() => {
    setPendingVersion(null);
  }, []);

  const confirmRevert = useCallback(async () => {
    if (!pendingVersion) {
      return;
    }

    setIsReverting(true);

    try {
      // Step 1: Auto-save current state (adapter handles version snapshot)
      // This preserves the current prompt as a version before we overwrite it
      await updatePrompt(promptId, {
        title: currentPrompt.title,
        body: currentPrompt.body,
        variables: currentPrompt.variables,
        isPinned: currentPrompt.isPinned,
        timesUsed: currentPrompt.timesUsed,
      });

      // Step 2: Revert to the selected version's content
      // Pass revertedFromVersionId to track which version was reverted to
      await updatePrompt(promptId, {
        title: pendingVersion.title,
        body: pendingVersion.body,
        variables: pendingVersion.variables,
        isPinned: currentPrompt.isPinned, // Preserve pin state
        timesUsed: currentPrompt.timesUsed, // Preserve usage count
      }, {
        revertedFromVersionId: pendingVersion.id,
      });

      toast.success(`Reverted to version ${pendingVersion.versionNumber}`);
      setPendingVersion(null);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to revert to version:', err);
      toast.error('Failed to revert. Please try again.');
    } finally {
      setIsReverting(false);
    }
  }, [pendingVersion, promptId, currentPrompt, updatePrompt, onSuccess]);

  return {
    isReverting,
    pendingVersion,
    requestRevert,
    confirmRevert,
    cancelRevert,
  };
}
