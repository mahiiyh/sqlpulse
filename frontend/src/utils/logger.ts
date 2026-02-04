const isDevelopment = import.meta.env.DEV;

interface LoggerInterface {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
}

export const logger: LoggerInterface = {
  log: (...args: any[]) => {
    if (isDevelopment) console.log(...args);
  },
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // Send to error tracking service in production
    if (!isDevelopment && typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(args[0]);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) console.warn(...args);
  },
  info: (...args: any[]) => {
    if (isDevelopment) console.info(...args);
  }
};
