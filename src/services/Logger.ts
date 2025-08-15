export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
}

export class Logger {
  private isUserInputActive = false;
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  setUserInputActive(active: boolean) {
    this.isUserInputActive = active;
  }

  isInInputMode(): boolean {
    return this.isUserInputActive;
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    return `[${timestamp}] [${level}]${contextStr} ${message}`;
  }

  private log(level: LogLevel, message: string, context?: string) {
    const formattedMessage = this.formatMessage(level, message, context);
    
    console.log(formattedMessage);
  }

  debug(message: string, context?: string) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: string) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: string) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: string) {
    this.log(LogLevel.ERROR, message, context);
  }

  bot(message: string) {
    if (!this.isUserInputActive) {
      console.log(`[BOT] ${message}`);
    }
  }

  input(message: string) {
    console.log(`[INPUT] ${message}`);
  }
}
