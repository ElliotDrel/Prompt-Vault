import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Plus, Trash2, Pin } from 'lucide-react';
import { Prompt } from '@/types/prompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePrompts } from '@/contexts/PromptsContext';
import toast from 'react-hot-toast';
import { HighlightedTextarea } from './HighlightedTextarea';
import { assignVariableColors, getContrastTextColor, getGreyColor, GREY_COLOR_LIGHT, GREY_COLOR_DARK, parseVariableReferences } from '@/utils/colorUtils';

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Omit<Prompt, 'id' | 'updatedAt'>) => Promise<void>;
  onDelete?: (promptId: string) => Promise<void>;
  prompt?: Prompt; // If provided, we're editing; otherwise creating
}

export function EditorModal({ isOpen, onClose, onSave, onDelete, prompt }: EditorModalProps) {
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

  const isEditing = !!prompt;

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
        const normalizedRef = ref.replace(/\s+/g, '').toLowerCase();
        const isDefined = variables.some(v => {
          const normalizedVar = v.replace(/\s+/g, '').toLowerCase();
          return normalizedVar === normalizedRef;
        });

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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (prompt) {
        setTitle(prompt.title);
        setBody(prompt.body);
        setVariables([...prompt.variables]);
        setOriginalData({
          title: prompt.title,
          body: prompt.body,
          variables: [...prompt.variables]
        });
      } else {
        setTitle('');
        setBody('');
        setVariables([]);
        setOriginalData({ title: '', body: '', variables: [] });
      }
      setNewVariable('');
      setHasShownUndefinedDialog(false); // Reset dialog flag for new modal session
    }
  }, [isOpen, prompt]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalData) return false;
    return (
      title !== originalData.title ||
      body !== originalData.body ||
      JSON.stringify(variables) !== JSON.stringify(originalData.variables)
    );
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedChanges(true);
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) {
      return;
    }

    try {
      await onSave({
        title: title.trim(),
        body: body.trim(),
        variables: variables.filter((value) => value.trim()),
      });
      onClose();
    } catch (err) {
      console.error('Failed to save prompt:', err);
      toast.error('Failed to save prompt');
    }
  };

  const addVariable = () => {
    const trimmed = newVariable.trim();
    if (!trimmed) return;
    
    if (variables.includes(trimmed)) {
      toast.error('Variable already exists');
      return;
    }
    
    setVariables(prev => [...prev, trimmed]);
    setNewVariable('');
  };

  const removeVariable = (variable: string) => {
    setVariables(prev => prev.filter(v => v !== variable));
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
      await togglePinPrompt(prompt.id);
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
      onClose();
      toast.success('Prompt deleted');
    } catch (err) {
      console.error('Failed to delete prompt:', err);
      toast.error('Failed to delete prompt');
    }
  };

  const handleAddUndefinedVariables = () => {
    // Add all undefined variables to the variables list
    const newVars = [...variables];
    undefinedVariables.forEach(uv => {
      if (!newVars.includes(uv)) {
        newVars.push(uv);
      }
    });
    setVariables(newVars);
    setUndefinedVariables([]);
    setShowUndefinedDialog(false);
    toast.success(`Added ${undefinedVariables.length} variable${undefinedVariables.length > 1 ? 's' : ''}`);
  };

  const handleDismissUndefinedDialog = () => {
    setUndefinedVariables([]);
    setShowUndefinedDialog(false);
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={handleClose}
          />
          
          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="modal-content relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 z-10"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold">
                {isEditing ? 'Edit Prompt' : 'Create New Prompt'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
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
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" onClick={(e) => e.preventDefault()} />
                    </TooltipTrigger>
                     <TooltipContent side="right" className="max-w-xs">
                       <p>Define variable names that can be used in your prompt with {`{variable}`} syntax.</p>
                     </TooltipContent>
                  </Tooltip>
                </div>
                
                {/* Variable chips */}
                {variables.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                     {variables.map(variable => {
                       const color = variableColors.get(variable) || getGreyColor();
                       const isGrey = color === GREY_COLOR_LIGHT || color === GREY_COLOR_DARK;
                       const textColor = isGrey ? undefined : getContrastTextColor(color);
                       
                       return (
                          <div
                            key={variable}
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
                <Button variant="outline" onClick={handleClose}>
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
          </motion.div>
        </div>
      )}

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedChanges} onOpenChange={setShowUnsavedChanges}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save them before closing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowUnsavedChanges(false);
              onClose();
            }}>
              Discard Changes
            </AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              setShowUnsavedChanges(false);
              await handleSave();
            }}>
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
                      <code key={v} className="px-2 py-1 bg-muted rounded text-sm font-mono mr-2 mb-2 inline-block">
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
    </AnimatePresence>
  );
}
