import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Pin } from 'lucide-react';
import toast from 'react-hot-toast';
import { Prompt, VariableValues } from '@/types/prompt';
import { buildPromptPayload, copyToClipboard, formatRelativeTime } from '@/utils/promptUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePrompts } from '@/contexts/PromptsContext';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  const { incrementCopyCount, incrementPromptUsage, togglePinPrompt } = usePrompts();
  const [variableValues, setVariableValues] = useState<VariableValues>({});

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    const payload = buildPromptPayload(prompt, variableValues);
    const success = await copyToClipboard(payload);
    
    if (success) {
      incrementCopyCount();
      incrementPromptUsage(prompt.id);
      const message = payload.length > 50000 
        ? 'Copied (Prompt duplicated because limit exceeded)'
        : 'Copied';
      toast.success(message);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    togglePinPrompt(prompt.id);
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
      {prompt.variables.length > 0 && (
        <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
          {prompt.variables.map(variable => (
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
                onChange={(e) => handleVariableChange(variable, e.target.value)}
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
        className="w-full mt-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy
      </Button>
    </motion.div>
  );
}