/**
 * Retry configuration options
 */
export interface RetryOptions {
  maxAttempts?: number; // Maximum number of retry attempts (default: 3)
  initialDelay?: number; // Initial delay in milliseconds (default: 1000)
  maxDelay?: number; // Maximum delay in milliseconds (default: 10000)
  backoffFactor?: number; // Exponential backoff multiplier (default: 2)
  shouldRetry?: (error: Error) => boolean; // Custom function to determine if error is retryable
  onRetry?: (attempt: number, error: Error, nextDelay: number) => void; // Callback before each retry
}

/**
 * Error class for network-related errors
 */
export class NetworkError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Check if an error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    errorMessage.includes('network') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('err_connection') ||
    errorMessage.includes('net::')
  );
}

/**
 * Check if user is authenticated based on error message
 */
export function isAuthError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    errorMessage.includes('not authenticated') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('invalid token') ||
    errorMessage.includes('session expired')
  );
}

/**
 * Default retry predicate - retry on network errors but not auth errors
 */
function defaultShouldRetry(error: Error): boolean {
  return isNetworkError(error) && !isAuthError(error);
}

/**
 * Execute an async function with retry logic and exponential backoff
 * @param fn The async function to execute
 * @param options Retry configuration options
 * @returns Promise with the function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt or if error is not retryable
      if (attempt === maxAttempts || !shouldRetry(lastError)) {
        throw lastError;
      }

      // Calculate next delay with exponential backoff
      const nextDelay = Math.min(delay, maxDelay);

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError, nextDelay);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, nextDelay));

      // Increase delay for next attempt
      delay *= backoffFactor;
    }
  }

  throw lastError!;
}
