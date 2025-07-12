import { Prompt, VariableValues } from '@/types/prompt';

const CHARACTER_LIMIT = 50000;

export function buildPromptPayload(prompt: Prompt, variableValues: VariableValues): string {
  let payload = prompt.body;
  
  // Check if body contains {variable} patterns
  const hasVariablePlaceholders = prompt.variables.some(variable => 
    payload.includes(`{${variable}}`)
  );
  
  if (hasVariablePlaceholders) {
    // Replace {variable} with <variable>value</variable>
    prompt.variables.forEach(variable => {
      const value = variableValues[variable] || '';
      const xmlVariableName = variable.replace(/\s+/g, '');
      const regex = new RegExp(`\\{${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`, 'g');
      payload = payload.replace(regex, `<${xmlVariableName}>${value}</${xmlVariableName}>`);
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