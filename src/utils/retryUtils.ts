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

/**
 * Queue for storing failed operations to retry when network comes back
 */
export class RetryQueue {
  private queue: Array<{
    id: string;
    fn: () => Promise<unknown>;
    onSuccess?: (result: unknown) => void;
    onError?: (error: Error) => void;
  }> = [];

  private processing = false;

  /**
   * Add an operation to the retry queue
   */
  add(
    id: string,
    fn: () => Promise<unknown>,
    callbacks?: {
      onSuccess?: (result: unknown) => void;
      onError?: (error: Error) => void;
    }
  ): void {
    // Remove duplicate if exists
    this.queue = this.queue.filter((item) => item.id !== id);

    // Add to queue
    this.queue.push({
      id,
      fn,
      onSuccess: callbacks?.onSuccess,
      onError: callbacks?.onError,
    });
  }

  /**
   * Remove an operation from the queue
   */
  remove(id: string): void {
    this.queue = this.queue.filter((item) => item.id !== id);
  }

  /**
   * Process all queued operations
   */
  async processAll(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    const itemsToProcess = [...this.queue];
    this.queue = [];

    for (const item of itemsToProcess) {
      try {
        const result = await withRetry(item.fn);
        item.onSuccess?.(result);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        item.onError?.(err);

        // If still a network error, add back to queue
        if (isNetworkError(err)) {
          this.queue.push(item);
        }
      }
    }

    this.processing = false;
  }

  /**
   * Get the number of pending operations
   */
  get size(): number {
    return this.queue.length;
  }

  /**
   * Clear all pending operations
   */
  clear(): void {
    this.queue = [];
  }
}
