/**
 * Simple logger utility with log levels
 * @module utils/logger
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

const currentLevel = (import.meta.env.VITE_LOG_LEVEL as string)?.toUpperCase() || 'INFO';

const levelMap: Record<string, LogLevel> = {
  'ERROR': LogLevel.ERROR,
  'WARN': LogLevel.WARN,
  'INFO': LogLevel.INFO,
  'DEBUG': LogLevel.DEBUG,
};

const configuredLevel = levelMap[currentLevel] ?? LogLevel.INFO;

export class Logger {
  constructor(private prefix: string) {}

  private log(level: LogLevel, message: string, ...args: unknown[]) {
    if (level > configuredLevel) return;

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const formatted = `[${timestamp}] [${levelName}] [${this.prefix}] ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted, ...args);
        break;
      case LogLevel.WARN:
        console.warn(formatted, ...args);
        break;
      case LogLevel.INFO:
        console.info(formatted, ...args);
        break;
      case LogLevel.DEBUG:
        console.debug(formatted, ...args);
        break;
    }
  }

  error(message: string, ...args: unknown[]) {
    this.log(LogLevel.ERROR, message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.log(LogLevel.WARN, message, ...args);
  }

  info(message: string, ...args: unknown[]) {
    this.log(LogLevel.INFO, message, ...args);
  }

  debug(message: string, ...args: unknown[]) {
    this.log(LogLevel.DEBUG, message, ...args);
  }
}

export const createLogger = (prefix: string) => new Logger(prefix);
