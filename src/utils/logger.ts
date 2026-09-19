// Structured logger with secret redaction

type LogFn = (...args: unknown[]) => void;

interface Logger {
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

const SECRET_KEYS = ['password', 'secret', 'token', 'authorization', 'cookie'];

const redactObject = (obj: unknown): unknown => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SECRET_KEYS.some((secretKey) => lowerKey.includes(secretKey))) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = redactObject(value);
    }
  }
  return result;
};

const logger: Logger = {
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    const redactedArgs = args.map((arg) => redactObject(arg));
    console.debug('[DEBUG]', ...redactedArgs);
  },

  info: (...args: unknown[]) => {
    const redactedArgs = args.map((arg) => redactObject(arg));
    console.info('[INFO]', ...redactedArgs);
  },

  warn: (...args: unknown[]) => {
    const redactedArgs = args.map((arg) => redactObject(arg));
    console.warn('[WARN]', ...redactedArgs);
  },

  error: (...args: unknown[]) => {
    const redactedArgs = args.map((arg) => redactObject(arg));
    console.error('[ERROR]', ...redactedArgs);
  },
};

export default logger;
