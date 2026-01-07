import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedTextProps {
  text: string;
  className?: string;
  threshold?: number; // Virtualize only if text exceeds this length
}

export function VirtualizedText({
  text,
  className = '',
  threshold = 2000
}: VirtualizedTextProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Split text into lines for virtualization
  const lines = text.split('\n');

  // Only virtualize if text is long enough
  const shouldVirtualize = text.length > threshold;

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24, // Estimated line height in pixels
    overscan: 5, // Render 5 extra items above/below viewport
    enabled: shouldVirtualize,
  });

  if (!shouldVirtualize) {
    // Render normally for short text
    return (
      <pre className={className}>{text}</pre>
    );
  }

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ maxHeight: '400px' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <pre className={className} style={{ margin: 0 }}>
              {lines[virtualRow.index] || '\u00A0'}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
