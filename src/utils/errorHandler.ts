import { toast } from 'sonner';
import logger from '@/utils/logger';

interface ErrorHandlerOptions {
  silent?: boolean;
  context?: string;
}

export function handleError(error: unknown, options: ErrorHandlerOptions = {}) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';

  logger.error(message, {
    context: options.context,
    error: error instanceof Error ? { message: error.message, stack: error.stack } : error
  });

  if (!options.silent) {
    toast.error(options.context ? `${options.context}: ${message}` : message);
  }
}
