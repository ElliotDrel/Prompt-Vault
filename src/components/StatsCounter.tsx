import React from 'react';
import { usePrompts } from '@/contexts/PromptsContext';

export function StatsCounter() {
  const { stats } = usePrompts();
  
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">{stats.totalPrompts}</span>
        <span>prompts</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">{stats.totalCopies}</span>
        <span>copied</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">{formatTime(stats.timeSavedMinutes)}</span>
        <span>saved</span>
      </div>
    </div>
  );
}