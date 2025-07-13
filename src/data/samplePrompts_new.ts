import { Prompt } from '@/types/prompt';

export const samplePrompts: Prompt[] = [
  {
    id: 'sample-1',
    title: 'Root Cause Analysis for Build Failures',
    body: 'The goal is to identify the ROOT problem, not a quick fix. Reflect on 5-7 different possible sources of the problem, distill those down to 1-2 most likely sources of the root problem, and then create a detailed report outlining what the issue is and suggested solutions, with an explanation for each.\n\nFailed Build Logs:\n{failed_build_logs}\n\nPlease analyze systematically:\n\n1. **Initial Assessment**: What type of failure is this?\n2. **Possible Root Causes**: List 5-7 potential sources\n3. **Evidence Analysis**: What clues do the logs provide?\n4. **Root Cause Identification**: Narrow down to 1-2 most likely causes\n5. **Detailed Solutions**: Provide specific, actionable fixes\n6. **Prevention Strategy**: How to avoid this in the future',
    variables: ['failed_build_logs'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isPinned: true,
    timesUsed: 12,
    timeSavedMinutes: 180,
  }
];
