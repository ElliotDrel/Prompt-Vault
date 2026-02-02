import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePrompts } from '@/contexts/PromptsContext';
import { Navigation } from '@/components/Navigation';
import { PromptView } from '@/components/PromptView';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/ui/NavLink';
import { usePublicPrompt } from '@/hooks/usePublicPrompt';
import { LIBRARY_ROUTE } from '@/config/routes';

export default function PublicPromptDetail() {
  const { promptId } = useParams<{ promptId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { prompt, loading, error } = usePublicPrompt(promptId);
  const { togglePinPrompt, incrementCopyCount, incrementPromptUsage } = usePrompts();

  // Determine if current user is the owner of this public prompt
  const isOwner = prompt && prompt.authorId === user?.id;

  // Handle navigation back to library
  const handleNavigateBack = () => {
    navigate(LIBRARY_ROUTE);
  };

  // Handle navigation to dashboard view (for owner)
  const handleViewInDashboard = () => {
    if (promptId) {
      navigate(`/dashboard/prompt/${promptId}`);
    }
  };

  // Loading state
  if (loading) {
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

  // Error state or prompt not found
  if (error || !prompt) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Prompt Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This prompt doesn't exist or isn't publicly available.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <NavLink to={LIBRARY_ROUTE}>
                Back to Library
              </NavLink>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <PromptView
        prompt={prompt}
        onEdit={undefined}           // Hide edit for public view
        onDelete={undefined}         // Hide delete for public view
        onNavigateBack={handleNavigateBack}
        backLabel="Back to Library"
        backRoute={LIBRARY_ROUTE}
        showVersionHistory={false}   // Always hide in public view (use Dashboard for history)
        showVisibilityToggle={false} // Never show visibility toggle in public view
        showPinButton={false}        // Never show pin button in public view
        isOwnerViewingPublic={isOwner}
        onViewInDashboard={isOwner ? handleViewInDashboard : undefined}
      />
    </>
  );
}
