import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Plus, Trash2 } from 'lucide-react';
import { Prompt } from '@/types/prompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Omit<Prompt, 'id' | 'updatedAt'>) => void;
  onDelete?: (promptId: string) => void;
  prompt?: Prompt; // If provided, we're editing; otherwise creating
}

export function EditorModal({ isOpen, onClose, onSave, onDelete, prompt }: EditorModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState('');

  const isEditing = !!prompt;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (prompt) {
        setTitle(prompt.title);
        setBody(prompt.body);
        setVariables([...prompt.variables]);
      } else {
        setTitle('');
        setBody('');
        setVariables([]);
      }
      setNewVariable('');
    }
  }, [isOpen, prompt]);

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
    if (trimmed && !variables.includes(trimmed)) {
      setVariables(prev => [...prev, trimmed]);
      setNewVariable('');
    }
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

  const handleDelete = () => {
    if (prompt && onDelete) {
      onDelete(prompt.id);
      onClose();
    }
  };

  // Get variables referenced in the body
  const getReferencedVariables = () => {
    const matches = body.match(/\{([^}]+)\}/g) || [];
    return matches.map(match => match.slice(1, -1));
  };

  const referencedVariables = getReferencedVariables();

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
            onClick={onClose}
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
                onClick={onClose}
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
                       <p>Add the main content of your prompt. Use {`{variable}`} syntax to place variables inline, or list variables below to append them in XML format after the prompt.</p>
                     </TooltipContent>
                  </Tooltip>
                </div>
                 <Textarea
                   id="body"
                   placeholder="Your prompt text with {variables} in curly braces"
                   value={body}
                   onChange={(e) => setBody(e.target.value)}
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
                       <p>Define variable names. Use {`{variable}`} in the body for inline placement, or variables will be appended in XML format like &lt;variable&gt;value&lt;/variable&gt;.</p>
                     </TooltipContent>
                  </Tooltip>
                </div>
                
                {/* Variable chips */}
                {variables.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                     {variables.map(variable => {
                       const isReferenced = referencedVariables.includes(variable);
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
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              ) : (
                <div />
              )}
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
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
    </AnimatePresence>
  );
}