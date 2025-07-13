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
  },
  {
    id: 'sample-2',
    title: 'Technical Plan Review & Optimization',
    body: 'Review {developer_name}\'s plan ({plan_to_fix_root_issue}) to fix the Vercel build error found in the attached logs {failed_vercel_build_logs}. For your review, do the following:\n\n**Review Criteria:**\n• Check if each proposed step directly addresses the root cause of the error\n• Flag any technical mistakes or missing actions\n• Identify risks or dependencies not mentioned\n• Note any unclear reasoning or steps that need clarification\n• Suggest more efficient or robust solutions\n• Reference specific evidence to support your feedback\n\n**Final Assessment:**\nMake a final determination if the method {developer_name} used to fix the ROOT cause of the problem (not a quick fix) is the best and most optimal method to solve this problem for long-term stability.\n\n**Deliverables:**\n1. Updated plan for the optimal way to solve the root issue\n2. Detailed report of {developer_name}\'s plan and the changes you had to make',
    variables: ['developer_name', 'plan_to_fix_root_issue', 'failed_vercel_build_logs'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isPinned: true,
    timesUsed: 8,
    timeSavedMinutes: 120,
  },
  {
    id: 'sample-3',
    title: 'Systematic Code Debugging Workflow',
    body: 'Based on the following task list and plan, start working on the next task. Before starting to code, clearly articulate a detailed plan of action and implementation, then step by step execute on the plan.\n\n**Current Context:**\n{current_task_context}\n\n**Error/Issue Description:**\n{error_description}\n\n**Environment Details:**\n{environment_info}\n\n**Step-by-Step Process:**\n\n1. **Problem Analysis**\n   - Define the exact issue\n   - Identify affected components\n   - Determine scope of impact\n\n2. **Investigation Plan**\n   - List debugging steps\n   - Identify tools needed\n   - Set success criteria\n\n3. **Implementation Strategy**\n   - Break down solution into phases\n   - Identify dependencies\n   - Plan testing approach\n\n4. **Execution & Validation**\n   - Implement fixes incrementally\n   - Test each change\n   - Document results\n\nProvide detailed reasoning for each decision made during the debugging process.',
    variables: ['current_task_context', 'error_description', 'environment_info'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isPinned: false,
    timesUsed: 15,
    timeSavedMinutes: 200,
  }
];
