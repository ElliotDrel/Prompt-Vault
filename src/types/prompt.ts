export interface Prompt {
  id: string;
  title: string;
  body: string;
  variables: string[];
  updatedAt: string;
  isPinned?: boolean;
  timesUsed?: number;
}

export interface VariableValues {
  [key: string]: string;
}

export interface PromptWithValues extends Prompt {
  variableValues: VariableValues;
}

export interface CopyEvent {
  id: string;
  promptId: string;
  promptTitle: string;
  variableValues: VariableValues;
  copiedText: string;
  timestamp: string;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  userId: string;
  versionNumber: number;
  title: string;
  body: string;
  variables: string[];
  isConsolidated: boolean;
  consolidationGroupId: string | null;
  createdAt: string;
}

export interface PaginatedVersions {
  versions: PromptVersion[];
  hasMore: boolean;
  totalCount: number;
}