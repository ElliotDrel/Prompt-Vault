import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';

interface VariableChangesProps {
  oldVariables: string[];
  newVariables: string[];
}

/**
 * Displays variable additions and removals between two prompt versions.
 *
 * Renders inline badge chips:
 * - Green badges with "+" icon for variables added in newVariables
 * - Red badges with "-" icon for variables removed from oldVariables
 *
 * If no changes, renders nothing (returns null).
 */
export function VariableChanges({ oldVariables, newVariables }: VariableChangesProps) {
  // Compute additions: variables in new but not in old
  const additions = newVariables.filter(v => !oldVariables.includes(v));

  // Compute removals: variables in old but not in new
  const removals = oldVariables.filter(v => !newVariables.includes(v));

  // No changes - render nothing
  if (additions.length === 0 && removals.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {removals.map((variable, index) => (
        <Badge key={`removed-${variable || 'empty'}-${index}`} variant="destructive" className="gap-1">
          <Minus className="h-3 w-3" />
          {variable}
        </Badge>
      ))}

      {additions.map((variable, index) => (
        <Badge key={`added-${variable || 'empty'}-${index}`} variant="success" className="gap-1">
          <Plus className="h-3 w-3" />
          {variable}
        </Badge>
      ))}
    </div>
  );
}
