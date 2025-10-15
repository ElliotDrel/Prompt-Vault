import React, { useRef, useEffect, useState } from 'react';
import { assignVariableColors, parseVariableReferences, GREY_COLOR_LIGHT, GREY_COLOR_DARK } from '@/utils/colorUtils';
import { cn } from '@/lib/utils';

interface HighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  variables: string[];
  placeholder?: string;
  rows?: number;
  className?: string;
  id?: string;
}

/**
 * HighlightedTextarea - A textarea with syntax highlighting for variable references
 * Uses an overlay approach to maintain native textarea functionality while adding visual highlights
 */
export function HighlightedTextarea({
  value,
  onChange,
  variables,
  placeholder,
  rows = 8,
  className,
  id,
}: HighlightedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [variableColors, setVariableColors] = useState<Map<string, string>>(new Map());

  // Update colors when variables or value changes
  useEffect(() => {
    const colors = assignVariableColors(variables, value);
    setVariableColors(colors);
  }, [variables, value]);

  // Synchronize scroll between textarea and highlight layer
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Generate highlighted HTML for the background layer
  const getHighlightedText = (): React.ReactNode[] => {
    if (!value) {
      return [];
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /\{([^}]+)\}/g;
    let match;
    let keyCounter = 0;

    while ((match = regex.exec(value)) !== null) {
      const variableName = match[1].trim();
      const matchStart = match.index;
      const matchEnd = matchStart + match[0].length;

      // Add text before the match
      if (matchStart > lastIndex) {
        parts.push(
          <span key={`text-${keyCounter++}`}>
            {value.substring(lastIndex, matchStart)}
          </span>
        );
      }

      // Find the matching variable (supports whitespace normalization)
      const normalizedMatch = variableName.replace(/\s+/g, '');
      const matchingVariable = variables.find(v => {
        const normalizedVar = v.replace(/\s+/g, '');
        return normalizedVar === normalizedMatch;
      });

      // Add the highlighted variable or plain text if not found
      if (matchingVariable) {
        const color = variableColors.get(matchingVariable);
        
        // Only highlight if the variable has a color and is not grey (is used)
        const isGrey = color === GREY_COLOR_LIGHT || color === GREY_COLOR_DARK;
        if (color && !isGrey) {
          parts.push(
            <mark
              key={`highlight-${keyCounter++}`}
              style={{
                backgroundColor: color,
                color: 'white',
                padding: '2px 4px',
                borderRadius: '4px',
                fontWeight: '500',
              }}
            >
              {match[0]}
            </mark>
          );
        } else {
          // Grey color means not used, don't highlight
          parts.push(
            <span key={`text-${keyCounter++}`}>
              {match[0]}
            </span>
          );
        }
      } else {
        // Variable not in the list, don't highlight
        parts.push(
          <span key={`text-${keyCounter++}`}>
            {match[0]}
          </span>
        );
      }

      lastIndex = matchEnd;
    }

    // Add remaining text
    if (lastIndex < value.length) {
      parts.push(
        <span key={`text-${keyCounter++}`}>
          {value.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Common style classes for both layers to ensure perfect alignment
  const commonClasses = cn(
    'text-sm',
    'whitespace-pre-wrap break-words',
    'px-3 py-2',
    className
  );

  return (
    <div className="relative w-full highlighted-textarea-wrapper bg-background rounded-md">
      {/* Background highlight layer */}
      <div
        ref={highlightRef}
        className={cn(
          commonClasses,
          'absolute inset-0 overflow-auto',
          'pointer-events-none',
          'bg-transparent text-transparent',
          'border border-input rounded-md'
        )}
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
        aria-hidden="true"
      >
        <div className="min-h-full">
          {getHighlightedText()}
          {/* Add a newline at the end to match textarea behavior */}
          {value.endsWith('\n') && <span>{'\n'}</span>}
        </div>
      </div>

      {/* Foreground textarea */}
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          commonClasses,
          'relative z-10',
          'w-full resize-none',
          'bg-transparent',
          'border border-input rounded-md',
          'text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Make selection visible
          'selection:bg-primary/20'
        )}
        style={{
          caretColor: 'auto',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      />
    </div>
  );
}

