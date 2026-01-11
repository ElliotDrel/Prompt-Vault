import { isToday, isYesterday, isThisWeek, format } from 'date-fns';
import type { PromptVersion } from '@/types/prompt';

export type GroupedVersions = {
  [period: string]: PromptVersion[];
};

/**
 * Groups versions by time period for time-based accordion UI.
 *
 * Versions are categorized into:
 * - "Today" - versions created today
 * - "Yesterday" - versions created yesterday
 * - "Last 7 Days" - versions created this week (excluding today/yesterday)
 * - "MMMM yyyy" - monthly groups for older versions (e.g., "December 2025")
 *
 * Input versions should be sorted by created_at DESC (newest first).
 * Output preserves sort order within each group.
 *
 * @param versions - Array of PromptVersion objects (sorted newest to oldest)
 * @returns Object with period keys and version arrays as values
 *
 * @example
 * const grouped = groupVersionsByPeriod(versions);
 * // Returns: {
 * //   "Today": [v1, v2],
 * //   "Yesterday": [v3],
 * //   "Last 7 Days": [v4, v5],
 * //   "December 2025": [v6, v7, v8]
 * // }
 */
export function groupVersionsByPeriod(versions: PromptVersion[]): GroupedVersions {
  const groups: GroupedVersions = {};

  for (const version of versions) {
    const date = new Date(version.createdAt);

    let period: string;
    if (isToday(date)) {
      period = 'Today';
    } else if (isYesterday(date)) {
      period = 'Yesterday';
    } else if (isThisWeek(date)) {
      period = 'Last 7 Days';
    } else {
      // Monthly groups for older versions
      period = format(date, 'MMMM yyyy');
    }

    if (!groups[period]) {
      groups[period] = [];
    }
    groups[period].push(version);
  }

  return groups;
}
