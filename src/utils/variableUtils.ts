export const sanitizeVariables = (values: string[]): string[] => {
  const seen = new Set<string>();
  const sanitized: string[] = [];

  values.forEach((value) => {
    const normalized = value.trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    sanitized.push(normalized);
  });

  return sanitized;
};

