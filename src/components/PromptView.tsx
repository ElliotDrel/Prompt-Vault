import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Edit, Pin, Trash2, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { Prompt, VariableValues, CopyEvent } from '@/types/prompt';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CopyEventCard } from '@/components/CopyEventCard';
import { InfiniteScrollContainer } from '@/components/InfiniteScrollContainer';
import { usePrompts } from '@/contexts/PromptsContext';
import { usePromptCopyHistory } from '@/hooks/usePromptCopyHistory';
import toast from 'react-hot-toast';
import { assignVariableColors, getContrastTextColor, getGreyColor, GREY_COLOR_LIGHT, GREY_COLOR_DARK } from '@/utils/colorUtils';
import { copyToClipboard, buildPromptPayload } from '@/utils/promptUtils';
import { sanitizeVariables } from '@/utils/variableUtils';
import { DASHBOARD_ROUTE } from '@/config/routes';
import { NavLink } from '@/components/ui/NavLink';
import { HighlightedPromptBody } from '@/components/HighlightedPromptBody';

// SessionStorage helpers for persisting variable inputs
const STORAGE_KEY_PREFIX = 'prompt-variables-';

const loadVariableValues = (promptId: string): VariableValues => {
  try {
    const stored = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${promptId}`);
    return stored ? JSON.parse(stored) : {};
  } catch {
    // Gracefully degrade if sessionStorage is unavailable or data is corrupted
    return {};
  }
};

const saveVariableValues = (promptId: string, values: VariableValues): void => {
  try {
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${promptId}`, JSON.stringify(values));
  } catch {
    // Ignore quota errors or privacy mode restrictions
  }
};

const clearVariableValues = (promptId: string): void => {
  try {
    sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${promptId}`);
  } catch {
    // Ignore errors
  }
};

interface PromptViewProps {
  prompt: Prompt;
  onEdit: () => void;
  onDelete: (promptId: string) => Promise<void>;
  onNavigateBack: () => void;
}

export function PromptView({ prompt, onEdit, onDelete, onNavigateBack }: PromptViewProps) {
  const { stats, togglePinPrompt, incrementCopyCount, incrementPromptUsage } = usePrompts();
  const {
    promptHistory,
    totalCount,
    loading: historyLoading,
    error: historyError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchHistory,
    deleteCopyEvent: deletePromptEvent,
    addCopyEvent: addPromptEvent,
  } = usePromptCopyHistory({ promptId: prompt.id, limit: 10 });
  const handleRetryHistory = promptHistory.length > 0 && hasNextPage ? fetchNextPage : refetchHistory;
  const [variableValues, setVariableValues] = useState<VariableValues>(() => loadVariableValues(prompt.id));
  const [isCopied, setIsCopied] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const sanitizedVariables = useMemo(() => sanitizeVariables(prompt.variables), [prompt.variables]);
  const sanitizedPrompt = useMemo(
    () => ({ ...prompt, variables: sanitizedVariables }),
    [prompt, sanitizedVariables]
  );
  const variableColors = assignVariableColors(sanitizedVariables, prompt.body);

  // Auto-save variable values to sessionStorage whenever they change
  useEffect(() => {
    saveVariableValues(prompt.id, variableValues);
  }, [prompt.id, variableValues]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const totalTimeSavedMinutes = (prompt.timesUsed || 0) * stats.timeSavedMultiplier;

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  const handlePin = async () => {
    try {
      const wasPinned = prompt.isPinned;
      await togglePinPrompt(prompt.id);
      toast.success(wasPinned ? 'Prompt unpinned' : 'Prompt pinned');
    } catch (err) {
      toast.error('Failed to update pin state');
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(prompt.id);
      toast.success('Prompt deleted');
      onNavigateBack();
    } catch (err) {
      toast.error('Failed to delete prompt');
    }
  };

  const handleCopy = async () => {
    try {
      const payload = buildPromptPayload(sanitizedPrompt, variableValues);
      const success = await copyToClipboard(payload);

      if (!success) {
        toast.error('Failed to copy to clipboard');
        return;
      }

      await Promise.all([
        incrementCopyCount(),
        incrementPromptUsage(prompt.id),
      ]);

      await addPromptEvent({
        promptId: prompt.id,
        promptTitle: prompt.title,
        variableValues: { ...variableValues },
        copiedText: payload,
      });

      // Clear saved values after successful copy (transaction complete)
      clearVariableValues(prompt.id);
      setVariableValues({});

      // Trigger visual feedback
      setIsCopied(true);

      // Reset visual feedback after delay
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);

      const message = payload.length > 50000
        ? 'Copied (Prompt duplicated because limit exceeded)'
        : 'Copied';
      toast.success(message);
    } catch (err) {
      toast.error('Failed to record copy event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deletePromptEvent(id);
      toast.success('Copy event deleted. Note: This does not affect your usage statistics.');
    } catch (err) {
      toast.error('Failed to delete copy event');
    }
  };

  const handleCopyHistoryEvent = async (event: CopyEvent) => {
    try {
      const success = await copyToClipboard(event.copiedText);

      if (!success) {
        toast.error('Failed to copy to clipboard');
        return;
      }

      await Promise.all([
        incrementCopyCount(),
        incrementPromptUsage(event.promptId),
      ]);

      await addPromptEvent({
        promptId: event.promptId,
        promptTitle: event.promptTitle,
        variableValues: { ...event.variableValues },
        copiedText: event.copiedText,
      });

      toast.success('Copied from history');
    } catch (err) {
      toast.error('Failed to copy from history');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back button */}
        <Button variant="ghost" className="mb-6 -ml-2" asChild>
          <NavLink to={DASHBOARD_ROUTE} onNavigate={onNavigateBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </NavLink>
        </Button>

        {/* Main view card */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          {/* Header with title and Edit button */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{prompt.title}</h2>
              {prompt.isPinned && (
                <span className="inline-flex items-center gap-1 mt-2 text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                  <Pin className="h-3 w-3 fill-current" />
                  Pinned
                </span>
              )}
            </div>
            <Button onClick={onEdit} className="bg-primary hover:bg-primary/90">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          <div className="space-y-6">
            {/* Variable inputs */}
            {sanitizedVariables.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Fill Variables</Label>
                {sanitizedVariables.map((variable) => (
                  <div key={variable} className="space-y-1">
                    <Label
                      htmlFor={`${prompt.id}-${variable}`}
                      className="text-sm text-muted-foreground"
                    >
                      {variable}
                    </Label>
                    <Input
                      id={`${prompt.id}-${variable}`}
                      type="text"
                      placeholder={`Enter ${variable}...`}
                      value={variableValues[variable] || ''}
                      onChange={(event) => handleVariableChange(variable, event.target.value)}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Copy button */}
            <Button
              onClick={handleCopy}
              className="w-full font-medium"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  {sanitizedVariables.length > 0 ? 'Copy with Variables' : 'Copy'}
                </>
              )}
            </Button>

            {/* Prompt body */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Prompt</Label>
              <div className="bg-muted/50 rounded-md p-4 font-mono">
                <HighlightedPromptBody
                  value={prompt.body}
                  variables={sanitizedVariables}
                  className="whitespace-pre-wrap break-all"
                />
              </div>
            </div>

            {/* Prompt Information */}
            <div className="pt-4 border-t space-y-3">
              <Label className="text-sm font-medium">Prompt Information</Label>

              {/* Variables */}
              {sanitizedVariables.length > 0 && (
                <div className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Variables:</span>
                  <div className="flex flex-wrap gap-2">
                    {sanitizedVariables.map((variable, index) => {
                      const color = variableColors.get(variable) || getGreyColor();
                      const isGrey = color === GREY_COLOR_LIGHT || color === GREY_COLOR_DARK;
                      const textColor = isGrey ? undefined : getContrastTextColor(color);

                      return (
                        <div
                          key={`${variable || 'unnamed'}-${index}`}
                          className={isGrey ? "px-3 py-1 rounded-full text-sm break-words bg-secondary text-secondary-foreground" : "px-3 py-1 rounded-full text-sm break-words"}
                          style={!isGrey ? { backgroundColor: color, color: textColor } : {}}
                        >
                          {variable}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Times used:</span>
                <span className="font-medium text-foreground">{prompt.timesUsed || 0}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Time saved:</span>
                <span className="font-medium text-foreground">{formatTime(totalTimeSavedMinutes)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Last updated:</span>
                <span className="font-medium text-foreground">
                  {new Date(prompt.updatedAt).toLocaleDateString()} {new Date(prompt.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this prompt? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-3">
              <Button
                onClick={handlePin}
                variant="outline"
                className={`${
                  prompt.isPinned
                    ? 'bg-yellow-100 border-yellow-400 text-yellow-700 hover:bg-yellow-200'
                    : 'hover:bg-yellow-50'
                }`}
              >
                <Pin className={`h-4 w-4 mr-2 ${prompt.isPinned ? 'fill-current' : ''}`} />
                {prompt.isPinned ? 'Unpin' : 'Pin'}
              </Button>
            </div>
          </div>
        </div>

        {/* Usage History - Separate Card */}
        <div className="mt-6">
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="flex items-center gap-2 mb-4 text-left font-medium hover:text-primary transition-colors"
          >
            {historyExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
            <span className="text-lg">Usage History</span>
            {totalCount > 0 && (
              <Badge variant="secondary">{totalCount}</Badge>
            )}
          </button>

          {historyExpanded && (
            <InfiniteScrollContainer
              items={promptHistory}
              totalCount={totalCount}
              loading={historyLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              error={historyError}
              fetchNextPage={fetchNextPage}
              onRetry={handleRetryHistory}
              renderItem={(event) => (
                <CopyEventCard
                  event={event}
                  onDelete={handleDeleteEvent}
                  onCopy={handleCopyHistoryEvent}
                />
              )}
              getItemKey={(event) => event.id}
              emptyMessage="No usage history yet. Copy this prompt to see its history here!"
              enableInfiniteScroll={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
