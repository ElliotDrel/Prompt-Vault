/**
 * Color utilities for variable highlighting
 * Provides color assignment and variable reference parsing
 */

import { parseVariableReferences, isVariableReferenced } from '@/config/variableRules';

// Vibrant color palette using HSL format for light/dark mode compatibility
// These colors are distinct and work well as highlights
export const COLOR_PALETTE = [
  'hsl(217, 91%, 60%)',  // Electric Blue
  'hsl(271, 76%, 53%)',  // Purple
  'hsl(340, 82%, 52%)',  // Pink
  'hsl(25, 95%, 53%)',   // Orange
  'hsl(142, 71%, 45%)',  // Green
  'hsl(189, 94%, 43%)',  // Teal
  'hsl(0, 84%, 60%)',    // Red
  'hsl(45, 93%, 47%)',   // Yellow/Gold
  'hsl(263, 70%, 50%)',  // Indigo
  'hsl(160, 84%, 39%)',  // Emerald
  'hsl(291, 64%, 42%)',  // Deep Purple
  'hsl(199, 89%, 48%)',  // Sky Blue
];

// Grey color for unused variables (matches secondary color from design system)
export const GREY_COLOR_LIGHT = 'hsl(220, 14%, 96%)'; // Light mode
export const GREY_COLOR_DARK = 'hsl(220, 27%, 16%)'; // Dark mode

/**
 * Get the appropriate grey color based on current theme
 * @returns Grey color for current theme
 */
export function getGreyColor(): string {
  // Check if dark mode is active
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? GREY_COLOR_DARK : GREY_COLOR_LIGHT;
}

// Re-export parsing functions from centralized config for backward compatibility
export { parseVariableReferences };

/**
 * Check if a specific variable is mentioned in the prompt body
 * Handles both exact matches and normalized matches (ignoring whitespace)
 * @param variable - The variable name to check
 * @param promptBody - The prompt text to search in
 * @returns true if the variable is mentioned
 */
export function isVariableMentioned(variable: string, promptBody: string): boolean {
  return isVariableReferenced(variable, promptBody);
}

/**
 * Assign colors to variables based on usage in prompt body
 * Variables that are used get vibrant colors from the palette
 * Variables that are not used get grey color
 * @param variables - Array of defined variable names
 * @param promptBody - The prompt text containing variable references
 * @returns Map of variable names to their assigned colors
 */
export function assignVariableColors(
  variables: string[],
  promptBody: string
): Map<string, string> {
  const colorMap = new Map<string, string>();
  let colorIndex = 0;
  const greyColor = getGreyColor();

  // First pass: assign colors to mentioned variables
  for (const variable of variables) {
    const mentioned = isVariableMentioned(variable, promptBody);

    if (mentioned) {
      // Assign a color from the palette (cycle if we have more variables than colors)
      const color = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
      colorMap.set(variable, color);
      colorIndex++;
    } else {
      // Variable not mentioned - use grey
      colorMap.set(variable, greyColor);
    }
  }

  return colorMap;
}

/**
 * Get a lighter version of a color for better readability on dark backgrounds
 * @param color - HSL color string
 * @returns Lightened HSL color string
 */
export function lightenColor(color: string): string {
  // Parse HSL color
  const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return color;
  
  const [, h, s, l] = match;
  // Increase lightness by 15% for better contrast
  const newLightness = Math.min(85, parseInt(l) + 15);
  
  return `hsl(${h}, ${s}%, ${newLightness}%)`;
}

/**
 * Get text color (black/white) based on background color for proper contrast
 * @param backgroundColor - HSL color string
 * @returns 'white' or 'black' for text color
 */
export function getContrastTextColor(backgroundColor: string): string {
  // Parse HSL color
  const match = backgroundColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return 'white';
  
  const lightness = parseInt(match[3]);
  
  // If lightness is above 60%, use dark text, otherwise use white text
  return lightness > 60 ? 'black' : 'white';
}

