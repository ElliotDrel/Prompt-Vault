import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Plus, Trash2, Pin } from 'lucide-react';
import { Prompt } from '@/types/prompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HighlightedTextarea } from '@/components/ui/highlighted-textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePrompts } from '@/contexts/PromptsContext';
import toast from 'react-hot-toast';

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Omit<Prompt, 'id' | 'updatedAt'>) => void;
  onDelete?: (promptId: string) => void;
  prompt?: Prompt; // If provided, we're editing; otherwise creating
}

export function EditorModal({ isOpen, onClose, onSave, onDelete, prompt }: EditorModalProps) {
  const { togglePinPrompt } = usePrompts();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<{ title: string; body: string; variables: string[] } | null>(null);

  const isEditing = !!prompt;

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

  const handleSave = () => {
    if (!title.trim() || !body.trim()) {
      return;
    }

    onSave({
      title: title.trim(),
      body: body.trim(),
      variables: variables.filter(v => v.trim()),
    });

    onClose();
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

  const handlePin = () => {
    if (prompt) {
      togglePinPrompt(prompt.id);
    }
  };

  const handleDelete = () => {
    if (prompt && onDelete) {
      onDelete(prompt.id);
      onClose();
    }
  };

  // Check if a variable is referenced (supports both spaced and non-spaced)
  const isVariableReferenced = (variable: string) => {
    const matches = body.match(/\{([^}]+)\}/g) || [];
    const referencedVariables = matches.map(match => match.slice(1, -1));
    
    return referencedVariables.some(referencedVar => {
      const normalizedRef = referencedVar.replace(/\s+/g, '');
      const normalizedVar = variable.replace(/\s+/g, '');
      return normalizedRef === normalizedVar;
    });
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
                       <p>Add the main content of your prompt. Use {`{variable}`} syntax to place variables inline. Variables will be highlighted in real-time as you type.</p>
                     </TooltipContent>
                  </Tooltip>
                </div>
                <HighlightedTextarea
                  id="body"
                  placeholder="Your prompt text with {variables} in curly braces"
                  value={body}
                  onChange={setBody}
                  rows={8}
                  variables={variables}
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
                       <p>Define variable names. Variables referenced as {`{variable}`} in the prompt will be highlighted in real-time in the text area above.</p>
                     </TooltipContent>
                  </Tooltip>
                </div>
                
                {/* Variable chips */}
                {variables.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                     {variables.map(variable => {
                        const isReferenced = isVariableReferenced(variable);
                        return (
                          <div
                            key={variable}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                              isReferenced 
                                ? 'bg-primary/20 text-primary border border-primary/30' 
                                : 'bg-secondary text-secondary-foreground'
                            }`}
                          >
                           <span>{variable}</span>
                           <button
                             onClick={() => removeVariable(variable)}
                             className="text-muted-foreground hover:text-foreground ml-1"
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
            <AlertDialogAction onClick={() => {
              setShowUnsavedChanges(false);
              handleSave();
            }}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
}