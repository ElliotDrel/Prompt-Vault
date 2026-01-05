import React from 'react';
import { ArrowLeft, Edit, Pin, Trash2, Copy } from 'lucide-react';
import { Prompt } from '@/types/prompt';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePrompts } from '@/contexts/PromptsContext';
import toast from 'react-hot-toast';
import { assignVariableColors, getContrastTextColor, getGreyColor, GREY_COLOR_LIGHT, GREY_COLOR_DARK } from '@/utils/colorUtils';
import { copyToClipboard } from '@/utils/promptUtils';

interface PromptViewProps {
  prompt: Prompt;
  onEdit: () => void;
  onDelete: (promptId: string) => Promise<void>;
  onNavigateBack: () => void;
}

export function PromptView({ prompt, onEdit, onDelete, onNavigateBack }: PromptViewProps) {
  const { togglePinPrompt } = usePrompts();
  const variableColors = assignVariableColors(prompt.variables, prompt.body);

  const handlePin = async () => {
    try {
      const wasPinned = prompt.isPinned;
      await togglePinPrompt(prompt.id);
      toast.success(wasPinned ? 'Prompt unpinned' : 'Prompt pinned');
    } catch (err) {
      console.error('Failed to toggle pin state:', err);
      toast.error('Failed to update pin state');
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(prompt.id);
      toast.success('Prompt deleted');
      onNavigateBack();
    } catch (err) {
      console.error('Failed to delete prompt:', err);
      toast.error('Failed to delete prompt');
    }
  };

  const handleCopyBody = async () => {
    const success = await copyToClipboard(prompt.body);
    if (!success) {
      toast.error('Failed to copy to clipboard');
      return;
    }

    toast.success('Prompt copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={onNavigateBack}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Main view card */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          {/* Header with title and Edit button */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{prompt.title}</h2>
              {prompt.isPinned && (
                <span className="inline-flex items-center gap-1 mt-2 text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                  <Pin className="h-3 w-3 fill-current" />
                  Pinned
                </span>
              )}
            </div>
            <Button onClick={onEdit} className="bg-primary hover:bg-primary/90">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          <div className="space-y-6">
            {/* Prompt body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Prompt</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyBody}
                  className="h-8"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="bg-muted/50 rounded-md p-4 text-sm whitespace-pre-wrap font-mono">
                {prompt.body}
              </div>
            </div>

            {/* Variables */}
            {prompt.variables.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {prompt.variables.map((variable, index) => {
                    const color = variableColors.get(variable) || getGreyColor();
                    const isGrey = color === GREY_COLOR_LIGHT || color === GREY_COLOR_DARK;
                    const textColor = isGrey ? undefined : getContrastTextColor(color);

                    return (
                      <div
                        key={`${variable || 'unnamed'}-${index}`}
                        className={isGrey ? "px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground" : "px-3 py-1 rounded-full text-sm"}
                        style={!isGrey ? { backgroundColor: color, color: textColor } : {}}
                      >
                        {variable}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Times used:</span>
                <span className="font-medium text-foreground">{prompt.timesUsed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Time saved:</span>
                <span className="font-medium text-foreground">{prompt.timeSavedMinutes || 0} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Last updated:</span>
                <span className="font-medium text-foreground">
                  {new Date(prompt.updatedAt).toLocaleDateString()} {new Date(prompt.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this prompt? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-3">
              <Button
                onClick={handlePin}
                variant="outline"
                className={`${
                  prompt.isPinned
                    ? 'bg-yellow-100 border-yellow-400 text-yellow-700 hover:bg-yellow-200'
                    : 'hover:bg-yellow-50'
                }`}
              >
                <Pin className={`h-4 w-4 mr-2 ${prompt.isPinned ? 'fill-current' : ''}`} />
                {prompt.isPinned ? 'Unpin' : 'Pin'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
