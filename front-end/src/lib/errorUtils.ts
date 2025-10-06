/**
 * Clean up error messages to be more user-friendly by removing technical details
 * and keeping only the main error message and user-relevant information
 * @param errorMessage - The raw error message from the backend
 * @returns A cleaned, user-friendly error message
 */
export function cleanErrorMessage(errorMessage: string): string {
  if (!errorMessage) return errorMessage;

  let cleaned = errorMessage;

  // Remove error IDs
  cleaned = cleaned.replace(/"errorId":"[a-f0-9-]+",?/g, '');

  // Remove path information
  cleaned = cleaned.replace(/"path":"[^"]*",?/g, '');

  // Remove timestamp information
  cleaned = cleaned.replace(/"timestamp":"[^"]*",?/g, '');

  // Remove errorType
  cleaned = cleaned.replace(/"errorType":"[^"]*",?/g, '');

  // Remove code field
  cleaned = cleaned.replace(/"code":"?[^",]*"?,?/g, '');

  // Keep message but make it more readable
  cleaned = cleaned.replace(/"message":"([^"]*)",?/g, '$1');

  // Keep details field but make it more readable
  cleaned = cleaned.replace(/"details":"([^"]*)",?/g, ' $1');

  // Clean up JSON-like formatting - remove quotes around field names
  cleaned = cleaned.replace(/"([^"]+)":/g, '$1: ');

  // Remove escaped quotes
  cleaned = cleaned.replace(/\\"/g, '"');

  // Clean up JSON braces and brackets
  cleaned = cleaned.replace(/[{}[\]]/g, '');

  // Replace commas with line breaks for better readability
  cleaned = cleaned.replace(/,\s*/g, '\n');

  // Clean up multiple spaces and normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\n\s+/g, '\n');

  // Remove leading/trailing whitespace and unnecessary punctuation
  cleaned = cleaned.trim();

  // Remove leading colons or commas
  cleaned = cleaned.replace(/^[,:]\s*/, '');

  // Clean up empty lines
  cleaned = cleaned.replace(/\n\s*\n/g, '\n');

  return cleaned || 'An unexpected error occurred';
}

/**
 * Extract the user-friendly message from an error response JSON string
 * @param errorResponseText - The raw error response text from the API
 * @returns A cleaned user message with all details
 */
export function extractUserMessage(errorResponseText: string): string {
  try {
    // Try to parse as JSON first
    const errorObj = JSON.parse(errorResponseText);
    
    // Clean the whole error object to show all details
    return cleanErrorMessage(errorResponseText);
    
  } catch {
    // If it's not valid JSON, just clean it as a regular string
    return cleanErrorMessage(errorResponseText);
  }
}
