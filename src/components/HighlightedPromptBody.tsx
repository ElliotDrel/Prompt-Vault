import React, { useMemo } from 'react';
import { assignVariableColors } from '@/utils/colorUtils';
import { cn } from '@/lib/utils';
import { getHighlightedTextParts } from '@/components/HighlightedTextarea';

interface HighlightedPromptBodyProps {
  value: string;
  variables: string[];
  className?: string;
}

export function HighlightedPromptBody({
  value,
  variables,
  className,
}: HighlightedPromptBodyProps) {
  const variableColors = useMemo(
    () => assignVariableColors(variables, value),
    [variables, value]
  );

  return (
    <div
      className={cn(
        'text-sm whitespace-pre-wrap',
        className
      )}
    >
      {getHighlightedTextParts({ value, variables, variableColors })}
    </div>
  );
}
