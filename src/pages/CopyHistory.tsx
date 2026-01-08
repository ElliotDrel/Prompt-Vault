import { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PaginatedCopyEvents } from '@/lib/storage/types';
import { useCopyHistory } from '@/contexts/CopyHistoryContext';
import { usePrompts } from '@/contexts/PromptsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CopyEventCard } from '@/components/CopyEventCard';
import { InfiniteScrollContainer } from '@/components/InfiniteScrollContainer';
import { CopyEvent } from '@/types/prompt';
import { copyToClipboard } from '@/utils/promptUtils';
import { Trash2, Search, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CopyHistory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const cacheUserId = user?.id ?? 'anonymous';
  const {
    copyHistory,
    loading,
    error,
    clearHistory,
    deleteCopyEvent,
    addCopyEvent,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    totalCount,
    refetch,
    searchCopyEvents,
    searchResults,
    isSearching,
    clearSearch,
  } = useCopyHistory();
  const { incrementCopyCount, incrementPromptUsage } = usePrompts();
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trim extra pages on unmount to optimize memory while keeping first page cached
  useEffect(() => {
    return () => {
      // Keep only the first page for instant load on return, remove extra pages
      queryClient.setQueryData<InfiniteData<PaginatedCopyEvents>>(
        ['copyEvents', 'copyHistory', cacheUserId],
        (old) => {
          if (!old?.pages || old.pages.length <= 1) return old;

          // Keep only the first page and its params
          return {
            pages: [old.pages[0]],
            pageParams: [old.pageParams[0]],
          };
        }
      );
    };
  }, [queryClient, cacheUserId]);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search is cleared, reset to normal view
    if (!searchTerm) {
      clearSearch();
      return;
    }

    // Debounce search for 300ms
    searchTimeoutRef.current = setTimeout(() => {
      searchCopyEvents(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchCopyEvents, clearSearch]);

  const handleClearHistory = useCallback(async () => {
    try {
      await clearHistory();
      setSearchTerm('');
      clearSearch();
      toast.success('Copy history cleared successfully. Note: This does not affect your usage statistics.');
    } catch (err) {
      console.error('Failed to clear copy history:', err);
      toast.error('Failed to clear copy history');
    }
  }, [clearHistory, clearSearch]);

  const handleDeleteEvent = useCallback(async (id: string) => {
    try {
      await deleteCopyEvent(id);
      toast.success('Copy event deleted. Note: This does not affect your usage statistics.');
    } catch (err) {
      console.error('Failed to delete copy event:', err);
      toast.error('Failed to delete copy event');
    }
  }, [deleteCopyEvent]);

  const handleCopyHistoryEvent = useCallback(async (event: CopyEvent) => {
    try {
      const success = await copyToClipboard(event.copiedText);

      if (!success) {
        toast.error('Failed to copy to clipboard');
        return;
      }

      await Promise.all([
        incrementCopyCount(),
        incrementPromptUsage(event.promptId),
      ]);

      await addCopyEvent({
        promptId: event.promptId,
        promptTitle: event.promptTitle,
        variableValues: { ...event.variableValues },
        copiedText: event.copiedText,
      });

      toast.success('Copied from history');
    } catch (err) {
      console.error('Failed to copy history event:', err);
      toast.error('Failed to copy from history');
    }
  }, [incrementCopyCount, incrementPromptUsage, addCopyEvent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Copy History</h1>
          <p className="text-muted-foreground">Track all your prompt copies with timestamps and variable values</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search entire copy history (title + variables)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {copyHistory.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Copy History</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all copy history. This action cannot be undone.
                    <br /><br />
                    <strong>Note:</strong> Clearing your copy history will not affect your usage statistics. Your prompt usage counts and time saved metrics will remain unchanged.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>
                    Clear History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Search status indicator */}
        {searchTerm && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching entire copy history...</span>
              </>
            ) : searchResults !== null ? (
              <span>Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} in entire history</span>
            ) : null}
          </div>
        )}

        {/* Show search results if searching, otherwise show paginated history */}
        {searchResults !== null ? (
          searchResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchTerm ? `No results found for "${searchTerm}"` : "No matches found."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {searchResults.map((event) => (
                <CopyEventCard
                  key={event.id}
                  event={event}
                  onDelete={handleDeleteEvent}
                  onCopy={handleCopyHistoryEvent}
                />
              ))}
            </div>
          )
        ) : (
          <InfiniteScrollContainer
            items={copyHistory}
            totalCount={totalCount}
            loading={loading}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            error={error}
            fetchNextPage={fetchNextPage}
            onRetry={refetch}
            renderItem={(event) => (
              <CopyEventCard
                event={event}
                onDelete={handleDeleteEvent}
                onCopy={handleCopyHistoryEvent}
              />
            )}
            getItemKey={(event) => event.id}
            emptyMessage="No copy history yet. Start copying prompts to see them here!"
            enableInfiniteScroll={true}
          />
        )}
      </div>
    </div>
  );
};

export default CopyHistory;
