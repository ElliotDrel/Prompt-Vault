import { Prompt, VariableValues } from '@/types/prompt';

const CHARACTER_LIMIT = 50000;

export function buildPromptPayload(prompt: Prompt, variableValues: VariableValues): string {
  let payload = prompt.body;
  
  // Get all variable patterns in the body
  const variableMatches = payload.match(/\{([^}]+)\}/g) || [];
  const referencedVariables = variableMatches.map(match => match.slice(1, -1));
  
  if (referencedVariables.length > 0) {
    // Replace {variable} with <variable>value</variable>
    referencedVariables.forEach(referencedVar => {
      // Find matching variable (supports both spaced and non-spaced)
      const matchingVariable = prompt.variables.find(variable => {
        const normalizedRef = referencedVar.replace(/\s+/g, '');
        const normalizedVar = variable.replace(/\s+/g, '');
        return normalizedRef === normalizedVar;
      });
      
      if (matchingVariable) {
        const value = variableValues[matchingVariable] || '';
        const xmlVariableName = matchingVariable.replace(/\s+/g, '');
        const regex = new RegExp(`\\{${referencedVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`, 'g');
        payload = payload.replace(regex, `<${xmlVariableName}>${value}</${xmlVariableName}>`);
      }
    });
  } else {
    // Append variables in XML format after the prompt
    const xmlVariables = prompt.variables
      .map(variable => {
        const value = variableValues[variable] || '';
        const xmlVariableName = variable.replace(/\s+/g, '');
        return `<${xmlVariableName}>${value}</${xmlVariableName}>`;
      })
      .join('');
    
    if (xmlVariables) {
      payload = payload + ' ' + xmlVariables;
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