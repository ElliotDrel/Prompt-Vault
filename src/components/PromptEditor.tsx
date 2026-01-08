import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Info, Plus, Trash2, Pin } from 'lucide-react';
import { Prompt } from '@/types/prompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePrompts } from '@/contexts/PromptsContext';
import toast from 'react-hot-toast';
import { useBlocker } from 'react-router-dom';
import { HighlightedTextarea } from './HighlightedTextarea';
import { assignVariableColors, getContrastTextColor, getGreyColor, GREY_COLOR_LIGHT, GREY_COLOR_DARK, parseVariableReferences } from '@/utils/colorUtils';
import { normalizeVariableName } from '@/config/variableRules';
import { sanitizeVariables } from '@/utils/variableUtils';

interface PromptEditorProps {
  mode: 'create' | 'edit';
  prompt?: Prompt; // Required when mode is 'edit'
  onSave: (prompt: Omit<Prompt, 'id' | 'updatedAt'>) => Promise<Prompt>;
  onDelete?: (promptId: string) => Promise<void>;
  onNavigateBack: () => void;
  onSaveSuccess?: (promptId: string) => void; // Called after successful save with prompt ID
}

export function PromptEditor({ mode, prompt, onSave, onDelete, onNavigateBack, onSaveSuccess }: PromptEditorProps) {
  const { togglePinPrompt } = usePrompts();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState('');
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<{ title: string; body: string; variables: string[] } | null>(null);
  const [variableColors, setVariableColors] = useState<Map<string, string>>(new Map());
  const [undefinedVariables, setUndefinedVariables] = useState<string[]>([]);
  const [showUndefinedDialog, setShowUndefinedDialog] = useState(false);
  const [hasShownUndefinedDialog, setHasShownUndefinedDialog] = useState(false);
  const [isVariableTooltipOpen, setIsVariableTooltipOpen] = useState(false);
  const [isVariableTooltipPinned, setIsVariableTooltipPinned] = useState(false);
  const variableTooltipTriggerRef = useRef<HTMLButtonElement | null>(null);
  const variableTooltipContentRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(true);
  const skipBlockerResetRef = useRef(false);
  const isSavingRef = useRef(false);

  const isEditing = mode === 'edit';

  // Update colors when variables or body changes
  useEffect(() => {
    const colors = assignVariableColors(variables, body);
    setVariableColors(colors);
  }, [variables, body]);

  // Detect undefined variables with debounce to avoid interrupting typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!body.trim()) {
        setUndefinedVariables([]);
        return;
      }

      const references = parseVariableReferences(body);
      const undefinedVars: string[] = [];

      references.forEach(ref => {
        const normalizedRef = normalizeVariableName(ref);
        const isDefined = variables.some(v => normalizeVariableName(v) === normalizedRef);

        if (!isDefined && !undefinedVars.includes(ref)) {
          undefinedVars.push(ref);
        }
      });

      if (undefinedVars.length > 0 && !hasShownUndefinedDialog) {
        setUndefinedVariables(undefinedVars);
        setShowUndefinedDialog(true);
        setHasShownUndefinedDialog(true);
      } else if (undefinedVars.length === 0) {
        setUndefinedVariables([]);
      }
    }, 1500); // 1.5 second debounce

    return () => clearTimeout(timeoutId);
  }, [body, variables, hasShownUndefinedDialog]);

  // Initialize form when component mounts or prompt changes
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (mode === 'edit' && prompt) {
      const sanitizedVars = sanitizeVariables(prompt.variables ?? []);
      setTitle(prompt.title);
      setBody(prompt.body);
      setVariables(sanitizedVars);
      setOriginalData({
        title: prompt.title,
        body: prompt.body,
        variables: sanitizedVars
      });
    } else if (mode === 'create') {
      setTitle('');
      setBody('');
      setVariables([]);
      setOriginalData({ title: '', body: '', variables: [] });
    }
    setNewVariable('');
    setHasShownUndefinedDialog(false);
  }, [mode, prompt]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    if (!originalData) return false;
    return (
      title !== originalData.title ||
      body !== originalData.body ||
      JSON.stringify(variables) !== JSON.stringify(originalData.variables)
    );
  }, [title, body, variables, originalData]);

  // Use a function so blocker evaluates current ref value when navigation is attempted
  const blocker = useBlocker(() => !isSavingRef.current && hasUnsavedChanges());

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowUnsavedChanges(true);
    }
  }, [blocker.state]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedChanges(true);
    } else {
      onNavigateBack();
    }
  };

  const handleSave = async ({ skipSuccessCallback = false }: { skipSuccessCallback?: boolean } = {}): Promise<boolean> => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle || !trimmedBody) {
      toast.error('Title and body are required');
      return false;
    }

    const sanitizedVars = sanitizeVariables(variables);
    setVariables(sanitizedVars);

    // Mark that we're saving to prevent blocker from triggering during navigation
    isSavingRef.current = true;

    try {
      const savedPrompt = await onSave({
        title: trimmedTitle,
        body: trimmedBody,
        variables: sanitizedVars,
      });

      if (isMountedRef.current) {
        // Update original data to reflect the save
        setOriginalData({
          title: trimmedTitle,
          body: trimmedBody,
          variables: sanitizedVars
        });
      }

      // Call success callback if provided (this may trigger navigation)
      if (onSaveSuccess && !skipSuccessCallback) {
        onSaveSuccess(savedPrompt.id);
      }

      toast.success(isEditing ? 'Prompt updated' : 'Prompt created');
      return true;
    } catch (err) {
      console.error('Failed to save prompt:', err);
      toast.error('Failed to save prompt');
      return false;
    } finally {
      // Reset saving flag after navigation completes
      // Use setTimeout to ensure navigation has been processed
      setTimeout(() => {
        isSavingRef.current = false;
      }, 0);
    }
  };

  const addVariable = () => {
    const trimmed = newVariable.trim();
    if (!trimmed) return;

    if (variables.includes(trimmed)) {
      toast.error('Variable already exists');
      return;
    }

    setVariables(prev => sanitizeVariables([...prev, trimmed]));
    setNewVariable('');
  };

  const removeVariable = (variable: string) => {
    setVariables(prev => sanitizeVariables(prev.filter(v => v !== variable)));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newVariable.trim()) {
      e.preventDefault();
      addVariable();
    }
  };

  const handlePin = async () => {
    if (!prompt) {
      return;
    }

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
    if (!prompt || !onDelete) {
      return;
    }

    try {
      await onDelete(prompt.id);
      toast.success('Prompt deleted');
      onNavigateBack();
    } catch (err) {
      console.error('Failed to delete prompt:', err);
      toast.error('Failed to delete prompt');
    }
  };

  const handleAddUndefinedVariables = () => {
    // Add all undefined variables to the variables list
    const newVars = [...variables];
    let addedCount = 0;

    undefinedVariables.forEach(uv => {
      const normalized = uv.trim();
      if (!normalized || newVars.includes(normalized)) {
        return;
      }

      newVars.push(normalized);
      addedCount++;
    });

    setVariables(sanitizeVariables(newVars));
    setUndefinedVariables([]);
    setShowUndefinedDialog(false);
    toast.success(
      addedCount > 0
        ? `Added ${addedCount} variable${addedCount > 1 ? 's' : ''}`
        : 'All variables are already defined'
    );
  };

  const handleVariableTooltipClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsVariableTooltipPinned((prev) => {
      const nextPinned = !prev;
      setIsVariableTooltipOpen(nextPinned);
      return nextPinned;
    });
  };

  useEffect(() => {
    if (!isVariableTooltipPinned) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        variableTooltipTriggerRef.current?.contains(target) ||
        variableTooltipContentRef.current?.contains(target)
      ) {
        return;
      }

      setIsVariableTooltipPinned(false);
      setIsVariableTooltipOpen(false);
    };

    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [isVariableTooltipPinned]);

  const handleDismissUndefinedDialog = () => {
    setUndefinedVariables([]);
    setShowUndefinedDialog(false);
  };

  const handleDiscardChanges = () => {
    const wasBlocked = blocker.state === 'blocked';
    if (wasBlocked) {
      skipBlockerResetRef.current = true;
    }
    setShowUnsavedChanges(false);
    if (wasBlocked) {
      blocker.proceed();
      return;
    }
    onNavigateBack();
  };

  const handleSaveChanges = async () => {
    const wasBlocked = blocker.state === 'blocked';
    const didSave = await handleSave({ skipSuccessCallback: wasBlocked });
    if (!didSave) {
      setShowUnsavedChanges(true);
      return;
    }

    if (wasBlocked) {
      skipBlockerResetRef.current = true;
    }
    setShowUnsavedChanges(false);
    if (wasBlocked) {
      blocker.proceed();
    }
  };

  const handleUnsavedDialogChange = (open: boolean) => {
    setShowUnsavedChanges(open);
    if (!open && blocker.state === 'blocked') {
      if (skipBlockerResetRef.current) {
        skipBlockerResetRef.current = false;
        return;
      }
      blocker.reset();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Main editor card */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">
              {isEditing ? 'Edit Prompt' : 'Create New Prompt'}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Title field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title
                </Label>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" onClick={(e) => e.preventDefault()} />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>A short, memorable title for your prompt. Example: "Email greeting pitch"</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="title"
                type="text"
                placeholder="Short memorable title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Body field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="body" className="text-sm font-medium">
                  Prompt
                </Label>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" onClick={(e) => e.preventDefault()} />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Add the main content of your prompt. Use {`{variable}`} syntax to place variables inline.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <HighlightedTextarea
                id="body"
                placeholder="Your prompt text with {variables} in curly braces"
                value={body}
                onChange={(value) => setBody(value)}
                variables={variables}
                rows={8}
                className="text-sm resize-none"
              />
            </div>

            {/* Variables field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">
                  Variables
                </Label>
                <Tooltip
                  delayDuration={0}
                  open={isVariableTooltipPinned || isVariableTooltipOpen}
                  onOpenChange={(open) => {
                    if (isVariableTooltipPinned) {
                      setIsVariableTooltipOpen(true);
                      return;
                    }
                    setIsVariableTooltipOpen(open);
                  }}
                >
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      ref={variableTooltipTriggerRef}
                      onClick={handleVariableTooltipClick}
                      className="p-0 h-4 w-4 text-muted-foreground cursor-help inline-flex items-center justify-center"
                      aria-label="How variables work"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    ref={variableTooltipContentRef}
                    side="right"
                    className="max-w-sm space-y-2 text-xs"
                  >
                    <p className="font-medium text-foreground">Using variables in prompts</p>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                      <li>
                        Add variables here exactly once per line. Use the same spelling inside your prompt with
                        curly braces&mdash;for example <code>{`{firstName}`}</code>.
                      </li>
                      <li>
                        When a variable wrapped in braces appears in the prompt, the vault replaces it inline when you
                        copy the prompt. If the braces are missing, the variable's value is appended afterwards as
                        <code>{`<firstName>value</firstName>`}</code> blocks.
                      </li>
                      <li>
                        Colors show usage: vibrant chips (and matching highlights in the prompt text) mean the
                        variable is referenced; grey chips mean it's defined here but not used yet.
                      </li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Variable chips */}
              {variables.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {variables.map((variable, index) => {
                    const color = variableColors.get(variable) || getGreyColor();
                    const isGrey = color === GREY_COLOR_LIGHT || color === GREY_COLOR_DARK;
                    const textColor = isGrey ? undefined : getContrastTextColor(color);

                    return (
                      <div
                        key={`${variable || 'unnamed'}-${index}`}
                        className={isGrey ? "flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground" : "flex items-center gap-1 px-3 py-1 rounded-full text-sm"}
                        style={!isGrey ? { backgroundColor: color, color: textColor } : {}}
                      >
                        <span>{variable}</span>
                        <button
                          onClick={() => removeVariable(variable)}
                          className={isGrey ? "text-muted-foreground hover:text-foreground ml-1" : "hover:opacity-80 ml-1"}
                          style={!isGrey ? { color: textColor } : {}}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add variable input */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter variable name (e.g., name, company)"
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-sm"
                />
                <Button
                  type="button"
                  onClick={addVariable}
                  disabled={!newVariable.trim() || variables.includes(newVariable.trim())}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            {isEditing && onDelete ? (
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
            ) : (
              <div />
            )}

            <div className="flex gap-3">
              {isEditing && (
                <Button
                  onClick={handlePin}
                  variant="outline"
                  className={`${
                    prompt?.isPinned
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-700 hover:bg-yellow-200'
                      : 'hover:bg-yellow-50'
                  }`}
                >
                  <Pin className={`h-4 w-4 mr-2 ${prompt?.isPinned ? 'fill-current' : ''}`} />
                  {prompt?.isPinned ? 'Unpin' : 'Pin'}
                </Button>
              )}
              <Button variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title.trim() || !body.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedChanges} onOpenChange={handleUnsavedDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save them before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardChanges}>
              Discard Changes
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveChanges}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Undefined Variables Dialog */}
      <AlertDialog open={showUndefinedDialog} onOpenChange={setShowUndefinedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Undefined Variables?</AlertDialogTitle>
            <AlertDialogDescription>
              {undefinedVariables.length === 1 ? (
                <>
                  Found variable <code className="px-2 py-1 bg-muted rounded text-sm font-mono">{undefinedVariables[0]}</code> in your prompt that hasn't been defined yet. Would you like to add it to your variables?
                </>
              ) : (
                <>
                  Found {undefinedVariables.length} undefined variables in your prompt:{' '}
                  <span className="block mt-2">
                    {undefinedVariables.map((v, i) => (
                      <code key={`${v || 'undefined'}-${i}`} className="px-2 py-1 bg-muted rounded text-sm font-mono mr-2 mb-2 inline-block">
                        {v}
                      </code>
                    ))}
                  </span>
                  Would you like to add them to your variables?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDismissUndefinedDialog}>
              Ignore
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAddUndefinedVariables}>
              Add Variable{undefinedVariables.length > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
