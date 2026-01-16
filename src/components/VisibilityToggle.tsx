import { useState } from 'react';
import { Globe, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VisibilityToggleProps {
  visibility: 'private' | 'public';
  onToggle: () => Promise<void>;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

export function VisibilityToggle({
  visibility,
  onToggle,
  disabled = false,
  size = 'default',
}: VisibilityToggleProps) {
  const [isToggling, setIsToggling] = useState(false);

  const isPublic = visibility === 'public';
  const Icon = isToggling ? Loader2 : isPublic ? Globe : Lock;
  const tooltipText = isPublic
    ? 'Public - Click to make private'
    : 'Private - Click to make public';

  const handleToggle = async () => {
    if (disabled || isToggling) return;

    setIsToggling(true);
    try {
      await onToggle();
    } finally {
      setIsToggling(false);
    }
  };

  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleToggle}
            disabled={disabled || isToggling}
            variant="outline"
            size="icon"
            className={`${buttonSize} ${
              isPublic
                ? 'bg-green-50 border-green-300 text-green-600 hover:bg-green-100 hover:text-green-700'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`${iconSize} ${isToggling ? 'animate-spin' : ''}`} />
            <span className="sr-only">{tooltipText}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
