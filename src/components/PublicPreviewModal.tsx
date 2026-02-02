import React, { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prompt, VariableValues } from '@/types/prompt';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HighlightedPromptBody } from '@/components/HighlightedPromptBody';
import { usePrompts } from '@/contexts/PromptsContext';
import { buildPromptPayload, copyToClipboard } from '@/utils/promptUtils';
import { sanitizeVariables } from '@/utils/variableUtils';
import toast from 'react-hot-toast';

interface PublicPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: Prompt;
}

export function PublicPreviewModal({ open, onOpenChange, prompt }: PublicPreviewModalProps) {
  const { stats, incrementCopyCount, incrementPromptUsage } = usePrompts();
  const [variableValues, setVariableValues] = useState<VariableValues>({});
  const [isCopied, setIsCopied] = useState(false);

  const sanitizedVariables = useMemo(() => sanitizeVariables(prompt.variables), [prompt.variables]);
  const sanitizedPrompt = useMemo(
    () => ({ ...prompt, variables: sanitizedVariables }),
    [prompt, sanitizedVariables]
  );

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  const handleCopy = async () => {
    try {
      const payload = buildPromptPayload(sanitizedPrompt, variableValues);
      const success = await copyToClipboard(payload);

      if (!success) {
        toast.error('Failed to copy to clipboard');
        return;
      }

      // Still track usage even in preview mode
      await Promise.all([
        incrementCopyCount(),
        incrementPromptUsage(prompt.id),
      ]);

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
      toast.success('Copied');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const totalTimeSavedMinutes = (prompt.timesUsed || 0) * stats.timeSavedMultiplier;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{prompt.title}</DialogTitle>
        </DialogHeader>

        {/* Info banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-3 rounded-r-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This is how others see your public prompt
          </p>
        </div>

        <div className="space-y-6">
          {/* Variable inputs */}
          {sanitizedVariables.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Fill Variables</Label>
              {sanitizedVariables.map((variable) => (
                <div key={variable} className="space-y-1">
                  <Label
                    htmlFor={`preview-${prompt.id}-${variable}`}
                    className="text-sm text-muted-foreground"
                  >
                    {variable}
                  </Label>
                  <Input
                    id={`preview-${prompt.id}-${variable}`}
                    type="text"
                    placeholder={`Enter ${variable}...`}
                    value={variableValues[variable] || ''}
                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Copy button */}
          <Button onClick={handleCopy} className="w-full font-medium">
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

          {/* Prompt Information (read-only stats) */}
          <div className="pt-4 border-t space-y-3">
            <Label className="text-sm font-medium">Prompt Information</Label>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Times used:</span>
              <span className="font-medium text-foreground">{prompt.timesUsed || 0}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Time saved:</span>
              <span className="font-medium text-foreground">{formatTime(totalTimeSavedMinutes)}</span>
            </div>
          </div>
        </div>

        {/* Close button in footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
