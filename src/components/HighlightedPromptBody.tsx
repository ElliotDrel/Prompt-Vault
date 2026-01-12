import React, { useEffect, useState } from 'react';
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
  const [variableColors, setVariableColors] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const colors = assignVariableColors(variables, value);
    setVariableColors(colors);
  }, [variables, value]);

  return (
    <div
      className={cn(
        'text-sm whitespace-pre-wrap break-words',
        className
      )}
    >
      {getHighlightedTextParts({ value, variables, variableColors })}
      {value.endsWith('\n') && <span>{'\n'}</span>}
    </div>
  );
}
