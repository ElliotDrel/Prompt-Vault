import { useState, memo } from 'react';
import { CopyEvent } from '@/types/prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Eye, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CopyEventCardProps {
  event: CopyEvent;
  onDelete: (id: string) => void;
  onCopy: (event: CopyEvent) => void;
}

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const truncateText = (text: string, maxLength: number = 100) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const CopyEventCard = memo(function CopyEventCard({ event, onDelete, onCopy }: CopyEventCardProps) {
  const [isDialogVariablesExpanded, setIsDialogVariablesExpanded] = useState(true);
  const [isDialogOutputExpanded, setIsDialogOutputExpanded] = useState(true);

  return (
    <Card className="hover:shadow-md transition-shadow">
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
                  <div className="flex items-start justify-between gap-4 pr-6">
                    <DialogTitle className="flex-1">{event.promptTitle}</DialogTitle>
                    <Button onClick={() => onCopy(event)} size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <DialogDescription>
                    View the complete details of this copy event, including all variable values and the final copied text.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Timestamp</h4>
                    <p className="text-sm">{formatDate(event.timestamp)}</p>
                  </div>

                  <Collapsible open={isDialogVariablesExpanded} onOpenChange={setIsDialogVariablesExpanded}>
                    <div className="flex items-center gap-2 mb-2">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent hover:text-foreground hover:underline -ml-2 text-foreground font-semibold text-base">
                          {isDialogVariablesExpanded ? (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-1" />
                          )}
                          Variables Used
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="space-y-2">
                        {Object.entries(event.variableValues).map(([key, value]) => (
                          <div key={key} className="border rounded p-3">
                            <Badge variant="secondary" className="mb-2">{key}</Badge>
                            <p className="text-sm whitespace-pre-wrap break-all">{value}</p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible open={isDialogOutputExpanded} onOpenChange={setIsDialogOutputExpanded}>
                    <div className="flex items-center gap-2 mb-2">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent hover:text-foreground hover:underline -ml-2 text-foreground font-semibold text-base">
                          {isDialogOutputExpanded ? (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-1" />
                          )}
                          Final Copied Text
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="border rounded p-3 bg-muted">
                        <pre className="text-sm whitespace-pre-wrap break-all">{event.copiedText}</pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
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
                  <AlertDialogAction onClick={() => onDelete(event.id)}>
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
                    <span className="text-sm text-muted-foreground flex-1 break-all">
                      {truncateText(value, 80)}
                    </span>
                  </div>
                ))}
                {Object.keys(event.variableValues).length > 3 && (
                  <p className="text-xs text-muted-foreground ml-2">
                    +{Object.keys(event.variableValues).length - 3} more variables
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Copied Text Preview */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Final Output Preview</h4>
            <div className="p-3 bg-muted/30 rounded border text-sm text-muted-foreground">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed break-all">
                {truncateText(event.copiedText, 200)}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
