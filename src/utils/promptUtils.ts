import { Prompt, VariableValues } from '@/types/prompt';

const CHARACTER_LIMIT = 50000;

// Helper function to check if there are non-space characters within 3 characters
// Newlines count as 3 spaces when checking proximity
function hasNonSpaceCharactersWithin3(text: string, variableRegex: RegExp): boolean {
  const matches = Array.from(text.matchAll(new RegExp(variableRegex.source, 'g')));
  
  for (const match of matches) {
    if (match.index === undefined) continue;
    
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;
    
    // Check 3 characters before
    const beforeText = text.substring(Math.max(0, startIndex - 3), startIndex);
    let beforeDistance = 0;
    for (let i = beforeText.length - 1; i >= 0; i--) {
      const char = beforeText[i];
      if (char === '\n') {
        beforeDistance += 3; // Newline counts as 3 spaces
      } else if (char !== ' ' && char !== '\t' && char !== '\r') {
        // Found non-space character, check if it's within effective distance
        if (beforeDistance + (beforeText.length - 1 - i) <= 3) {
          return true;
        }
        break;
      } else {
        beforeDistance += 1; // Regular space or tab
      }
    }
    
    // Check 3 characters after
    const afterText = text.substring(endIndex, Math.min(text.length, endIndex + 3));
    let afterDistance = 0;
    for (let i = 0; i < afterText.length; i++) {
      const char = afterText[i];
      if (char === '\n') {
        afterDistance += 3; // Newline counts as 3 spaces
      } else if (char !== ' ' && char !== '\t' && char !== '\r') {
        // Found non-space character, check if it's within effective distance
        if (afterDistance + i <= 3) {
          return true;
        }
        break;
      } else {
        afterDistance += 1; // Regular space or tab
      }
    }
  }
  
  return false;
}

export function buildPromptPayload(prompt: Prompt, variableValues: VariableValues): string {
  let payload = prompt.body;
  
  // Get all variable patterns in the body
  const variableMatches = payload.match(/\{([^}]+)\}/g) || [];
  const referencedVariables = variableMatches.map(match => match.slice(1, -1));
  
  if (referencedVariables.length > 0) {
    // Replace {variable} with value or <variable>value</variable> based on proximity rule
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
        
        // Check if there are non-space characters within 3 characters before or after
        const shouldUseXML = !hasNonSpaceCharactersWithin3(payload, regex);
        
        if (shouldUseXML) {
          payload = payload.replace(regex, `<${xmlVariableName}>${value}</${xmlVariableName}>`);
        } else {
          payload = payload.replace(regex, value);
        }
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