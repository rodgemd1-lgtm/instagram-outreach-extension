type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLevel: LogLevel = 'info';

export function setLogLevel(level: LogLevel) {
  currentLevel = level;
}

function log(level: LogLevel, context: string, message: string, data?: unknown) {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return;

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${context}]`;

  switch (level) {
    case 'debug':
      console.debug(prefix, message, data ?? '');
      break;
    case 'info':
      console.info(prefix, message, data ?? '');
      break;
    case 'warn':
      console.warn(prefix, message, data ?? '');
      break;
    case 'error':
      console.error(prefix, message, data ?? '');
      break;
  }
}

export function createLogger(context: string) {
  return {
    debug: (msg: string, data?: unknown) => log('debug', context, msg, data),
    info: (msg: string, data?: unknown) => log('info', context, msg, data),
    warn: (msg: string, data?: unknown) => log('warn', context, msg, data),
    error: (msg: string, data?: unknown) => log('error', context, msg, data),
  };
}
