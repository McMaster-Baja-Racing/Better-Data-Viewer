/**
 * Clean up error messages to be more user-friendly by keeping all details
 * but formatting them nicely for better readability
 * @param errorMessage - The raw error message from the backend
 * @returns A cleaned, user-friendly error message with all details
 */
export function cleanErrorMessage(errorMessage: string): string {
  if (!errorMessage) return errorMessage;

  let cleaned = errorMessage;

  // Keep error IDs but make them more readable
  cleaned = cleaned.replace(/"errorId":"([a-f0-9-]+)",?/g, '\nError ID: $1');

  // Keep path information but make it more readable
  cleaned = cleaned.replace(/"path":"([^"]*)",?/g, '\nPath: $1');

  // Keep timestamp information but make it more readable
  cleaned = cleaned.replace(/"timestamp":"([^"]*)",?/g, '\nTime: $1');

  // Keep errorType but make it more readable
  cleaned = cleaned.replace(/"errorType":"([^"]*)",?/g, '\nType: $1');

  // Keep details field but make it more readable
  cleaned = cleaned.replace(/"details":"([^"]*)",?/g, '\nDetails: $1');

  // Keep status codes
  cleaned = cleaned.replace(/"status":"?([^",]*)"?,?/g, '\nStatus: $1');
  cleaned = cleaned.replace(/"statusCode":"?([^",]*)"?,?/g, '\nStatus Code: $1');
  cleaned = cleaned.replace(/"code":"?([^",]*)"?,?/g, '\nCode: $1');

  // Keep message but make it more readable
  cleaned = cleaned.replace(/"message":"([^"]*)",?/g, '\nMessage: $1');

  // Clean up JSON-like formatting - remove quotes around field names
  cleaned = cleaned.replace(/"([^"]+)":/g, '\n$1: ');

  // Remove escaped quotes
  cleaned = cleaned.replace(/\\"/g, '"');

  // Clean up JSON braces and brackets
  cleaned = cleaned.replace(/[{}[\]]/g, '');

  // Replace commas with line breaks for better readability
  cleaned = cleaned.replace(/,\s*/g, '\n');

  // Clean up multiple spaces and normalize whitespace - but don't touch newlines yet
  cleaned = cleaned.replace(/[^\S\n]+/g, ' ');
  
  // Clean up spaces after newlines
  cleaned = cleaned.replace(/\n /g, '\n');

  // Remove leading/trailing whitespace and unnecessary punctuation
  cleaned = cleaned.trim();

  // Remove leading colons or commas
  cleaned = cleaned.replace(/^[,:]\s*/, '');

  // Clean up multiple consecutive newlines - replace with double newlines for better spacing
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

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
