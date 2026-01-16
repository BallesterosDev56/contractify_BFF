/**
 * Simple logger utility
 */

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

type LogLevel = keyof typeof logLevels;

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return logLevels[level] <= logLevels[currentLevel];
}

export const logger = {
  error: (message: string, ...args: unknown[]): void => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]): void => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: unknown[]): void => {
    if (shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: unknown[]): void => {
    if (shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};
