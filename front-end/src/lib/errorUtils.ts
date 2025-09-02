/**
 * Clean up error messages to be more user-friendly by removing technical details,
 * extra quotes, error IDs, and improving formatting for better readability
 * @param errorMessage - The raw error message from the backend
 * @returns A cleaned, user-friendly error message
 */
export function cleanErrorMessage(errorMessage: string): string {
  if (!errorMessage) return errorMessage;

  let cleaned = errorMessage;

  // Remove error IDs like "errorId":"a4bd8e88-adf3-4d2e-b1c8-0f6a3e170968"
  cleaned = cleaned.replace(/"errorId":"[a-f0-9-]+",?/g, '');

  // Remove path information like "path":"com.mcmasterbaja.SomeClass.someMethod"
  cleaned = cleaned.replace(/"path":"[^"]*",?/g, '');

  // Remove timestamp information
  cleaned = cleaned.replace(/"timestamp":"[^"]*",?/g, '');

  // Remove errorType if it's just technical info
  cleaned = cleaned.replace(/"errorType":"[^"]*",?/g, '');

  // Remove details field if it contains technical stack trace info
  cleaned = cleaned.replace(/"details":"[^"]*",?/g, '');

  // Clean up JSON-like formatting - remove quotes around field names
  cleaned = cleaned.replace(/"([^"]+)":/g, '$1:');

  // Remove escaped quotes
  cleaned = cleaned.replace(/\\"/g, '"');

  // Clean up JSON braces and brackets
  cleaned = cleaned.replace(/[{}[\]]/g, '');

  // Replace commas with line breaks for better readability
  cleaned = cleaned.replace(/,\s*/g, '\n');

  // Clean up multiple spaces and normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Remove leading/trailing whitespace and unnecessary punctuation
  cleaned = cleaned.trim();

  // Remove leading colons or commas
  cleaned = cleaned.replace(/^[,:]\s*/, '');

  // If the message starts with "message:" extract just the actual message
  const messageRegex = /message:\s*(.+)/i;
  const messageMatch = messageRegex.exec(cleaned);
  if (messageMatch) {
    cleaned = messageMatch[1].trim();
  }

  // Remove any remaining field labels that might be left over
  cleaned = cleaned.replace(/^(message|error|details|errorType|path):\s*/i, '');

  return cleaned || 'An unexpected error occurred';
}

/**
 * Extract the user-friendly message from an error response JSON string
 * @param errorResponseText - The raw error response text from the API
 * @returns A cleaned user message
 */
export function extractUserMessage(errorResponseText: string): string {
  try {
    // Try to parse as JSON first
    const errorObj = JSON.parse(errorResponseText);
    
    // Look for a message field
    if (errorObj.message) {
      return cleanErrorMessage(errorObj.message);
    }
    
    // Look for other common error message fields
    if (errorObj.userMessage) {
      return cleanErrorMessage(errorObj.userMessage);
    }
    
    if (errorObj.error) {
      return cleanErrorMessage(errorObj.error);
    }
    
    // If it's a JSON object but no clear message field, clean the whole thing
    return cleanErrorMessage(errorResponseText);
    
  } catch {
    // If it's not valid JSON, just clean it as a regular string
    return cleanErrorMessage(errorResponseText);
  }
}
