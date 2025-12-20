// @ts-nocheck
/**
 * Centralized logging utility
 * Replaces console.log/error/warn with structured logging
 * In production, should integrate with proper logging service (Winston, Pino, etc.)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';
  private logLevel: LogLevel;

  constructor() {
    // Set log level from env or default
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    this.logLevel = envLevel || (this.isDevelopment ? 'debug' : 'info');
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (context && Object.keys(context).length > 0) {
      // Remove sensitive data from context
      const sanitizedContext = this.sanitizeContext(context);
      return `${prefix} ${message} ${JSON.stringify(sanitizedContext)}`;
    }
    
    return `${prefix} ${message}`;
  }

  private sanitizeContext(context: LogContext): LogContext {
    const sensitiveKeys = ['password', 'secret', 'token', 'key', 'authorization', 'cookie'];
    const sanitized: LogContext = {};
    
    for (const [key, value] of Object.entries(context)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value as LogContext);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      if (this.isDevelopment) {
        console.debug(this.formatMessage('debug', message, context));
      }
      // In production, send to logging service
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
      // In production, send to logging service (e.g., Sentry, DataDog)
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
      // In production, send to logging service
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext: LogContext = {
        ...context,
        error: error instanceof Error ? {
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined,
          name: error.name,
        } : error,
      };
      
      console.error(this.formatMessage('error', message, errorContext));
      
      // In production, send to error tracking service (e.g., Sentry)
      if (this.isProduction && error instanceof Error) {
        // TODO: Integrate with Sentry or similar
        // Sentry.captureException(error, { extra: context });
      }
    }
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, statusCode: number, duration?: number, context?: LogContext): void {
    const message = `${method} ${path} ${statusCode}`;
    const logContext: LogContext = {
      ...context,
      method,
      path,
      statusCode,
      ...(duration !== undefined && { duration: `${duration}ms` }),
    };
    
    if (statusCode >= 500) {
      this.error(message, undefined, logContext);
    } else if (statusCode >= 400) {
      this.warn(message, logContext);
    } else {
      this.info(message, logContext);
    }
  }

  /**
   * Log database query (for debugging)
   */
  logQuery(query: string, duration?: number, context?: LogContext): void {
    if (this.isDevelopment) {
      this.debug(`DB Query: ${query}`, {
        ...context,
        duration: duration ? `${duration}ms` : undefined,
      });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };

// Convenience functions for common use cases
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error | unknown, context?: LogContext) => logger.error(message, error, context),
  request: (method: string, path: string, statusCode: number, duration?: number, context?: LogContext) =>
    logger.logRequest(method, path, statusCode, duration, context),
  query: (query: string, duration?: number, context?: LogContext) => logger.logQuery(query, duration, context),
};
