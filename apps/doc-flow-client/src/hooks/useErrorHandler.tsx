import { useCallback } from 'react';
import { ErrorProcessor } from '@/lib/utils/errorProcessor';
import { ErrorContext, ProcessedError } from '@/lib/types/errors';

interface UseErrorHandlerOptions {
  context?: Partial<ErrorContext>;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { context = {} } = options;

  const handleError = useCallback((error: unknown, additionalContext?: Partial<ErrorContext>): ProcessedError => {
    const fullContext: ErrorContext = {
      timestamp: new Date(),
      ...context,
      ...additionalContext
    };

    return ErrorProcessor.handleError(error, fullContext);
  }, [context]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<unknown>,
    errorContext?: Partial<ErrorContext>
  ): Promise<{ data?: unknown; error?: ProcessedError }> => {
    try {
      const data = await asyncFn();
      return { data };
    } catch (error) {
      const processedError = handleError(error, errorContext);
      return { error: processedError };
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
}
