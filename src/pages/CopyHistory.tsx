import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useCopyHistory } from '@/contexts/CopyHistoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CopyHistory = () => {
  const { copyHistory, clearHistory, deleteCopyEvent } = useCopyHistory();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = copyHistory.filter(event =>
    event.promptTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Object.values(event.variableValues).some(value =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleClearHistory = () => {
    clearHistory();
    toast.success('Copy history cleared successfully. Note: This does not affect your usage statistics.');
  };

  const handleDeleteEvent = (id: string) => {
    deleteCopyEvent(id);
    toast.success('Copy event deleted. Note: This does not affect your usage statistics.');
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getVariablePreview = (variableValues: Record<string, string>) => {
    const entries = Object.entries(variableValues);
    if (entries.length === 0) return 'No variables used';
    
    const preview = entries.slice(0, 2).map(([key, value]) => 
      `${key}: ${truncateText(value, 40)}`
    ).join(' • ');
    
    return entries.length > 2 ? `${preview} • +${entries.length - 2} more` : preview;
  };

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
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{event.promptTitle}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{event.promptTitle}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Timestamp</h4>
                              <p className="text-sm">{formatDate(event.timestamp)}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Variables Used</h4>
                              <div className="space-y-2">
                                {Object.entries(event.variableValues).map(([key, value]) => (
                                  <div key={key} className="border rounded p-3">
                                    <Badge variant="secondary" className="mb-2">{key}</Badge>
                                    <p className="text-sm whitespace-pre-wrap">{value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Final Copied Text</h4>
                              <div className="border rounded p-3 bg-muted">
                                <pre className="text-sm whitespace-pre-wrap">{event.copiedText}</pre>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Copy Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this copy event? This action cannot be undone.
                              <br /><br />
                              <strong>Note:</strong> Deleting this copy event will not affect your usage statistics.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Variables Section */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        Variables Used 
                        <Badge variant="secondary" className="text-xs">
                          {Object.keys(event.variableValues).length}
                        </Badge>
                      </h4>
                      {Object.keys(event.variableValues).length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No variables used</p>
                      ) : (
                        <div className="grid gap-2">
                          {Object.entries(event.variableValues).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex items-start gap-2 p-2 bg-muted/50 rounded border">
                              <Badge variant="outline" className="text-xs mt-0.5 shrink-0">{key}</Badge>
                              <span className="text-sm text-muted-foreground flex-1 break-words">
                                {truncateText(value, 80)}
                              </span>
                            </div>
                          ))}
                          {Object.keys(event.variableValues).length > 3 && (
                            <p className="text-xs text-muted-foreground ml-2">
                              +{Object.keys(event.variableValues).length - 3} more variables (click View to see all)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Copied Text Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Final Output Preview</h4>
                      <div className="p-3 bg-muted/30 rounded border text-sm text-muted-foreground">
                        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                          {truncateText(event.copiedText, 200)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyHistory;