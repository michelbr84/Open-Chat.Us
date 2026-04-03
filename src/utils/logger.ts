type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel = import.meta.env.PROD ? 'warn' : 'debug';

function formatLog(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  return context ? `${base} ${JSON.stringify(context)}` : base;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.debug(formatLog('debug', message, context));
    }
  },
  info: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(formatLog('info', message, context));
    }
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(formatLog('warn', message, context));
    }
  },
  error: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(formatLog('error', message, context));
    }
  },
};

export default logger;
