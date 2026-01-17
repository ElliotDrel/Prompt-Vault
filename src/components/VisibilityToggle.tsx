import { useState } from 'react';
import { Globe, Lock, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
}

export function VisibilityToggle({
  visibility,
  onToggle,
  disabled = false,
}: VisibilityToggleProps) {
  const [isToggling, setIsToggling] = useState(false);

  const isPublic = visibility === 'public';
  const tooltipText = isPublic
    ? 'Public - visible in the Prompt Library'
    : 'Private - only visible to you';

  const handleToggle = async () => {
    if (disabled || isToggling) return;

    setIsToggling(true);
    try {
      await onToggle();
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Lock className={`h-4 w-4 ${!isPublic ? 'text-foreground' : 'text-muted-foreground'}`} />
            <Switch
              checked={isPublic}
              onCheckedChange={handleToggle}
              disabled={disabled || isToggling}
              aria-label={tooltipText}
            />
            {isToggling ? (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <Globe className={`h-4 w-4 ${isPublic ? 'text-green-600' : 'text-muted-foreground'}`} />
            )}
            <Label className="text-sm font-medium">
              {isPublic ? 'Public' : 'Private'}
            </Label>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
