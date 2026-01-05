import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { usePrompts } from '@/contexts/PromptsContext';
import { Navigation } from '@/components/Navigation';
import { PromptEditor } from '@/components/PromptEditor';
import { PromptView } from '@/components/PromptView';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types/prompt';

export default function PromptDetail() {
  const { promptId } = useParams<{ promptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { prompts, loading, isBackgroundRefresh, addPrompt, updatePrompt, deletePrompt } = usePrompts();
  const defaultTitle = 'Prompt Vault';

  // Determine if we're creating a new prompt (check pathname for /new route)
  const isCreating = location.pathname.endsWith('/new');

  // For creating, start in edit mode. For viewing, start in view mode
  const [isEditing, setIsEditing] = useState(isCreating);

  // Sync editing state when route changes
  useEffect(() => {
    setIsEditing(isCreating);
  }, [isCreating, promptId]);

  const mode = isCreating ? 'create' : 'edit';

  // For edit mode, find the prompt by ID
  const prompt = !isCreating ? prompts.find(p => p.id === promptId) : undefined;

  useEffect(() => {
    let nextTitle = defaultTitle;

    if (isCreating) {
      nextTitle = `New Prompt - ${defaultTitle}`;
    } else if (prompt?.title?.trim()) {
      nextTitle = `${prompt.title.trim()} - ${defaultTitle}`;
    }

    document.title = nextTitle;

    return () => {
      document.title = defaultTitle;
    };
  }, [defaultTitle, isCreating, prompt?.title]);

  // Handle navigation back to dashboard
  const handleNavigateBack = () => {
    navigate('/dashboard');
  };

  // Handle cancel in edit mode
  const handleCancelEdit = () => {
    if (isCreating) {
      // If creating, navigate back to dashboard
      navigate('/dashboard');
    } else {
      // If editing existing prompt, exit edit mode
      setIsEditing(false);
    }
  };

  // Handle save for create mode
  const handleSaveCreate = async (promptData: Omit<Prompt, 'id' | 'updatedAt'>) => {
    const newPrompt = await addPrompt(promptData);
    return newPrompt;
  };

  // Handle save for edit mode
  const handleSaveEdit = async (promptData: Omit<Prompt, 'id' | 'updatedAt'>) => {
    if (!promptId) {
      throw new Error('Missing prompt ID');
    }
    const updatedPrompt = await updatePrompt(promptId, promptData);
    // Exit edit mode and stay on the page
    setIsEditing(false);
    return updatedPrompt;
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    await deletePrompt(id);
    // Navigation handled by the calling component after successful delete
  };

  // Loading state (initial load, not background refresh)
  if (loading && !isBackgroundRefresh) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">Loading prompt...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state: Prompt not found (invalid ID or unauthorized)
  if (!isCreating && !prompt) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Prompt Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This prompt doesn't exist or you don't have permission to access it.
            </p>
            <Button onClick={handleNavigateBack} className="bg-primary hover:bg-primary/90">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Render view or editor based on state
  return (
    <>
      <Navigation />

      {isEditing ? (
        <PromptEditor
          mode={mode}
          prompt={prompt}
          onSave={isCreating ? handleSaveCreate : handleSaveEdit}
          onDelete={handleDelete}
          onNavigateBack={handleCancelEdit}
          onSaveSuccess={isCreating ? (newPromptId) => navigate(`/dashboard/prompt/${newPromptId}`, { replace: true }) : undefined}
        />
      ) : (
        prompt && (
          <PromptView
            prompt={prompt}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            onNavigateBack={handleNavigateBack}
          />
        )
      )}
    </>
  );
}
