import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Pin, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Prompt, VariableValues } from '@/types/prompt';
import { buildPromptPayload, copyToClipboard, formatRelativeTime } from '@/utils/promptUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePrompts } from '@/contexts/PromptsContext';
import { useCopyHistory } from '@/contexts/CopyHistoryContext';
import { sanitizeVariables } from '@/utils/variableUtils';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  const { incrementCopyCount, incrementPromptUsage, togglePinPrompt } = usePrompts();
  const { addCopyEvent } = useCopyHistory();
  const [variableValues, setVariableValues] = useState<VariableValues>({});
  const [isCopied, setIsCopied] = useState(false);
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
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

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

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

      await addCopyEvent({
        promptId: prompt.id,
        promptTitle: prompt.title,
        variableValues: { ...variableValues },
        copiedText: payload,
      });

      // Trigger visual feedback
      setIsCopied(true);
      setShowSuccessEffect(true);

      // Reset visual feedback after delay
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);

      setTimeout(() => {
        setShowSuccessEffect(false);
      }, 2000);

      const message = payload.length > 50000
        ? 'Copied (Prompt duplicated because limit exceeded)'
        : 'Copied';
      toast.success(message);
    } catch (err) {
      console.error('Failed to handle prompt copy:', err);
      toast.error('Failed to record copy event');
    }
  };

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    try {
      await togglePinPrompt(prompt.id);
    } catch (err) {
      console.error('Failed to toggle pin state:', err);
      toast.error('Failed to update pin state');
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`prompt-card p-6 cursor-pointer flex flex-col gap-4 relative ${
        prompt.isPinned ? 'ring-2 ring-yellow-400 bg-yellow-50/30' : ''
      }`}
      onClick={onClick}
    >
      {/* Pin button */}
      <Button
        onClick={handlePin}
        variant="ghost"
        size="sm"
        className={`absolute top-2 right-2 h-8 w-8 p-0 ${
          prompt.isPinned ? 'text-yellow-600 hover:text-yellow-700' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Pin className={`h-4 w-4 ${prompt.isPinned ? 'fill-current' : ''}`} />
      </Button>

      {/* Header with timestamp and title */}
      <div className="flex flex-col gap-1 pr-10">
        <span className="text-xs text-muted-foreground">
          Last updated: {formatRelativeTime(prompt.updatedAt)}
        </span>
        <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 w-full">
          {prompt.title}
        </h3>
      </div>

      {/* Variable inputs */}
      {sanitizedVariables.length > 0 && (
        <div className="flex flex-col gap-3" onClick={(event) => event.stopPropagation()}>
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

      {/* Usage stats */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Used {prompt.timesUsed || 0} times</span>
        <span>Saved {formatTime(prompt.timeSavedMinutes || 0)}</span>
      </div>

      {/* Copy button */}
      <Button
        onClick={handleCopy}
        className={`w-full mt-auto font-medium transition-all duration-300 ${
          isCopied
            ? 'bg-white text-gray-800 border border-gray-200 hover:bg-white'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }`}
      >
        {isCopied ? (
          <Check className="h-4 w-4 mr-2" />
        ) : (
          <Copy className="h-4 w-4 mr-2" />
        )}
        {isCopied ? 'Copied!' : 'Copy'}
      </Button>

      {/* Success effect overlay */}
      <AnimatePresence>
        {showSuccessEffect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none rounded-lg border-2 border-green-400 bg-green-50/20"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg"
            >
              ?o" Copied successfully
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
