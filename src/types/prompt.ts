export interface Prompt {
  id: string;
  title: string;
  body: string;
  variables: string[];
  updatedAt: string;
  isPinned?: boolean;
  timesUsed?: number;
  timeSavedMinutes?: number;
}

export interface VariableValues {
  [key: string]: string;
}

export interface PromptWithValues extends Prompt {
  variableValues: VariableValues;
}