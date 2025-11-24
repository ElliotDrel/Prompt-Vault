import { Prompt, VariableValues } from '@/types/prompt';
import {
  CHARACTER_LIMIT,
  VARIABLE_PATTERN,
  createVariableRegex,
  findMatchingVariable,
  formatAsXML,
  isVariableReferenced,
  hasNearbyNonSpaceCharacters,
  extractVariableName,
} from '@/config/variableRules';

export function buildPromptPayload(prompt: Prompt, variableValues: VariableValues): string {
  let payload = prompt.body;

  const unreferencedVariables = prompt.variables.filter(
    variable => !isVariableReferenced(variable, prompt.body)
  );

  // Get all variable patterns in the body using centralized pattern
  const variableMatches = payload.match(new RegExp(VARIABLE_PATTERN.source, 'g')) || [];
  const referencedVariables = variableMatches.map(match => extractVariableName(match));
  const uniqueReferencedVariables = Array.from(new Set(referencedVariables));

  if (uniqueReferencedVariables.length > 0) {
    // Replace {variable} with value or <variable>value</variable> based on proximity rule
    uniqueReferencedVariables.forEach(referencedVar => {
      // Find matching variable using centralized matching logic
      const matchingVariable = findMatchingVariable(referencedVar, prompt.variables);
      
      if (matchingVariable) {
        const value = variableValues[matchingVariable] || '';
        const regex = createVariableRegex(referencedVar);
        
        // Check if there are non-space characters within proximity distance
        const shouldUseXML = !hasNearbyNonSpaceCharacters(payload, regex);
        
        if (shouldUseXML) {
          payload = payload.replace(regex, formatAsXML(matchingVariable, value));
        } else {
          payload = payload.replace(regex, value);
        }
      }
    });
  }

  if (unreferencedVariables.length > 0) {
    const unreferencedXml = unreferencedVariables
      .map(variable => formatAsXML(variable, variableValues[variable] || ''))
      .join('');

    if (unreferencedXml) {
      const separator = payload.endsWith('\n') ? '' : '\n';
      payload = `${payload}${separator}${unreferencedXml}`;
    }
  }

  // Apply character guard - duplicate if exceeds limit
  if (payload.length > CHARACTER_LIMIT) {
    payload = payload + ' ' + payload;
  }
  
  return payload;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays === 1) {
    return 'yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}
