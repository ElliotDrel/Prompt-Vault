import { normalizeVariableName } from '@/config/variableRules';

export const sanitizeVariables = (values: string[]): string[] => {
  const seen = new Set<string>();
  const sanitized: string[] = [];

  values.forEach((value) => {
    const normalized = value.trim();
    if (!normalized) {
      return;
    }

    const dedupeKey = normalizeVariableName(normalized);
    if (seen.has(dedupeKey)) {
      return;
    }

    seen.add(dedupeKey);
    sanitized.push(normalized);
  });

  return sanitized;
};
