import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { Prompt, VariableValues } from '@/types/prompt';
import { buildPromptPayload, copyToClipboard, formatRelativeTime } from '@/utils/promptUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  const [variableValues, setVariableValues] = useState<VariableValues>({});

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  // Get variables referenced in the body
  const getReferencedVariables = () => {
    const matches = prompt.body.match(/\{([^}]+)\}/g) || [];
    return matches.map(match => match.slice(1, -1));
  };

  const referencedVariables = getReferencedVariables();

  // Render prompt text with highlighted variables
  const renderPromptWithHighlights = () => {
    if (referencedVariables.length === 0) {
      return <span className="text-sm text-muted-foreground line-clamp-2">{prompt.body}</span>;
    }

    const parts = prompt.body.split(/(\{[^}]+\})/);
    return (
      <span className="text-sm text-muted-foreground line-clamp-2">
        {parts.map((part, index) => {
          if (part.match(/^\{[^}]+\}$/)) {
            return (
              <span key={index} className="text-primary font-medium bg-primary/10 px-1 rounded">
                {part}
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    const payload = buildPromptPayload(prompt, variableValues);
    const success = await copyToClipboard(payload);
    
    if (success) {
      const message = payload.length > 50000 
        ? 'Copied (Prompt duplicated because limit exceeded)'
        : 'Copied';
      toast.success(message);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="prompt-card p-6 cursor-pointer flex flex-col gap-4"
      onClick={onClick}
    >
      {/* Header with timestamp and title */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          Last updated: {formatRelativeTime(prompt.updatedAt)}
        </span>
        <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 w-full">
          {prompt.title}
        </h3>
      </div>

      {/* Prompt preview */}
      <div className="flex flex-col gap-2">
        {renderPromptWithHighlights()}
      </div>

      {/* Variable inputs */}
      {prompt.variables.length > 0 && (
        <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
          {prompt.variables.map(variable => {
            const isReferenced = referencedVariables.includes(variable);
            return (
              <div key={variable} className="space-y-1">
                <Label 
                  htmlFor={`${prompt.id}-${variable}`} 
                  className={`text-sm ${
                    isReferenced 
                      ? 'text-primary font-medium' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {variable}
                </Label>
                <Input
                  id={`${prompt.id}-${variable}`}
                  type="text"
                  placeholder={`Enter ${variable}...`}
                  value={variableValues[variable] || ''}
                  onChange={(e) => handleVariableChange(variable, e.target.value)}
                  className={`text-sm ${
                    isReferenced 
                      ? 'border-primary/50 focus:border-primary' 
                      : ''
                  }`}
                />
              </div>
            );
          })}
        </div>
      )}

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