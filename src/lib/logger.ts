type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private log(level: LogLevel, message: string, ...args: any[]) {
    // In a real app, this would send to a logging service (Datadog, Sentry, etc.)
    // For now, we just wrap console but ensure it's structured or filtered if needed.
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'info':
        console.log(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger();
