import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface HighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  variables?: string[];
  id?: string;
}

export function HighlightedTextarea({
  value,
  onChange,
  placeholder,
  className,
  rows = 8,
  variables = [],
  id,
}: HighlightedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Synchronize scroll position between textarea and highlight overlay
  const handleScroll = () => {
    if (textareaRef.current) {
      const newScrollTop = textareaRef.current.scrollTop;
      const newScrollLeft = textareaRef.current.scrollLeft;
      setScrollTop(newScrollTop);
      setScrollLeft(newScrollLeft);
    }
  };

  // Update highlight overlay scroll when state changes
  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollTop, scrollLeft]);

  // Check if a variable is referenced (supports both spaced and non-spaced)
  const isVariableReferenced = (variable: string) => {
    const matches = value.match(/\{([^}]+)\}/g) || [];
    const referencedVariables = matches.map(match => match.slice(1, -1));
    
    return referencedVariables.some(referencedVar => {
      const normalizedRef = referencedVar.replace(/\s+/g, '');
      const normalizedVar = variable.replace(/\s+/g, '');
      return normalizedRef === normalizedVar;
    });
  };

  // Render text with highlighted variables
  const renderHighlightedText = () => {
    if (!value) return '';
    
    const parts = value.split(/(\{[^}]+\})/);
    return parts.map((part, index) => {
      if (part.match(/^\{[^}]+\}$/)) {
        const variableName = part.slice(1, -1);
        const isKnownVariable = variables.some(variable => {
          const normalizedRef = variableName.replace(/\s+/g, '');
          const normalizedVar = variable.replace(/\s+/g, '');
          return normalizedRef === normalizedVar;
        });
        
        return (
          <span 
            key={index} 
            className={cn(
              "rounded px-1",
              isKnownVariable 
                ? "bg-primary/20 text-primary" 
                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="relative">
      {/* Highlight overlay */}
      <div
        ref={highlightRef}
        className={cn(
          "absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words",
          "font-mono text-sm leading-6 p-3",
          "text-transparent", // Make text invisible but preserve layout
          className
        )}
        style={{
          scrollTop,
          scrollLeft,
        }}
      >
        <div className="min-h-full">
          {renderHighlightedText()}
          {/* Add phantom character to ensure proper height when empty */}
          {!value && <span>&nbsp;</span>}
        </div>
      </div>

      {/* Actual textarea */}
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "relative z-10 w-full resize-none border border-input bg-transparent px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "font-mono leading-6", // Match highlight overlay
          "text-foreground caret-foreground selection:bg-primary/20",
          className
        )}
        style={{
          background: 'transparent',
        }}
      />
    </div>
  );
}
