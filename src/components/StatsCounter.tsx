import React, { useMemo, useState } from 'react';
import { usePrompts } from '@/contexts/PromptsContext';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function StatsCounter() {
  const { prompts, stats } = usePrompts();
  const [activeStatDialog, setActiveStatDialog] = useState<string | null>(null);

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const totalPromptUses = useMemo(() => {
    if (prompts.length === 0) {
      return stats.totalPromptUses || 0;
    }

    return prompts.reduce((sum, prompt) => sum + (prompt.timesUsed ?? 0), 0);
  }, [prompts, stats.totalPromptUses]);

  const totalTimeSaved = totalPromptUses * stats.timeSavedMultiplier;

  const statsData = [
    {
      id: 'prompts',
      label: 'Total Prompts',
      value: stats.totalPrompts,
      explanation: 'The total number of prompts you have saved in your vault.'
    },
    {
      id: 'copies',
      label: 'Times Copied',
      value: stats.totalCopies,
      explanation: 'The total number of times you have copied prompts to your clipboard.'
    },
    {
      id: 'time',
      label: 'Time Saved',
      value: formatTime(totalTimeSaved),
      explanation: `On average, you would spend ${stats.timeSavedMultiplier} minutes updating a prompt with proper variables, rewriting it, or finding it. This shows the cumulative time saved by using the Prompt Vault.`
    }
  ];

  return (
    <>
      <div className="flex gap-4 mb-6">
        {statsData.map((stat) => (
          <Card 
            key={stat.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveStatDialog(stat.id)}
          >
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Stat explanation dialogs */}
      {statsData.map((stat) => (
        <Dialog 
          key={`dialog-${stat.id}`}
          open={activeStatDialog === stat.id} 
          onOpenChange={(open) => !open && setActiveStatDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{stat.label}</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">{stat.explanation}</p>
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}
