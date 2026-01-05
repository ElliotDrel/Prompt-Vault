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