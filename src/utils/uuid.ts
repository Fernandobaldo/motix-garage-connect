
/**
 * UUID validation utility to prevent Postgres UUID syntax errors
 */

// Strict UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a proper UUID format
 * @param id - The string to validate
 * @returns true if valid UUID, false otherwise
 */
export const isValidUUID = (id: string): boolean => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return UUID_REGEX.test(id);
};

/**
 * Logs invalid UUID incidents for debugging
 * @param context - Where the invalid UUID was detected
 * @param invalidId - The invalid ID value
 */
export const logInvalidUUID = (context: string, invalidId: any): void => {
  console.error(`⚠️ Invalid UUID detected in ${context}:`, {
    invalidId,
    type: typeof invalidId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Checks if an error is a Postgres UUID syntax error
 * @param error - The error to check
 * @returns true if it's a UUID syntax error
 */
export const isUUIDError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  return (
    errorMessage.includes('invalid input syntax for type uuid') ||
    errorMessage.includes('22P02') ||
    error.code === '22P02'
  );
};
