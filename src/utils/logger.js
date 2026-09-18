// Structured logger with secret redaction
const SECRET_KEYS = ['password', 'secret', 'token', 'authorization', 'cookie'];

const redactObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item));
  }

  const result = {};
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

const logger = {
  debug: (...args) => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    const redactedArgs = args.map((arg) => redactObject(arg));
    console.debug('[DEBUG]', ...redactedArgs);
  },

  info: (...args) => {
    const redactedArgs = args.map((arg) => redactObject(arg));
    console.info('[INFO]', ...redactedArgs);
  },

  warn: (...args) => {
    const redactedArgs = args.map((arg) => redactObject(arg));
    console.warn('[WARN]', ...redactedArgs);
  },

  error: (...args) => {
    const redactedArgs = args.map((arg) => redactObject(arg));
    console.error('[ERROR]', ...redactedArgs);
  },
};

export default logger;
