import { useState, useCallback, useMemo } from 'react';
import { Navigation } from '@/components/Navigation';
import { useCopyHistory } from '@/contexts/CopyHistoryContext';
import { usePrompts } from '@/contexts/PromptsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CopyEventCard } from '@/components/CopyEventCard';
import { CopyEvent } from '@/types/prompt';
import { copyToClipboard } from '@/utils/promptUtils';
import { Trash2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CopyHistory = () => {
  const { copyHistory, clearHistory, deleteCopyEvent, addCopyEvent } = useCopyHistory();
  const { incrementCopyCount, incrementPromptUsage } = usePrompts();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(
    () => copyHistory.filter(event =>
      event.promptTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(event.variableValues).some(value =>
        value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ),
    [copyHistory, searchTerm]
  );

  const handleClearHistory = useCallback(async () => {
    try {
      await clearHistory();
      toast.success('Copy history cleared successfully. Note: This does not affect your usage statistics.');
    } catch (err) {
      console.error('Failed to clear copy history:', err);
      toast.error('Failed to clear copy history');
    }
  }, [clearHistory]);

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
              placeholder="Search copy history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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

        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {copyHistory.length === 0 
                  ? "No copy history yet. Start copying prompts to see them here!" 
                  : "No matches found for your search."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((event) => (
              <CopyEventCard
                key={event.id}
                event={event}
                onDelete={handleDeleteEvent}
                onCopy={handleCopyHistoryEvent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyHistory;