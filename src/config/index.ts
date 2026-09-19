// Config module - validates and exports environment configuration

interface Config {
  mongodbUri: string;
  jwtSecret: string;
  port: number;
  nodeEnv: string;
  corsOrigin: string;
}

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getMongoDbUri = (): string => getEnv('MONGODB_URI');

const getConfig = (): Config => {
  const portStr = getEnv('PORT');
  
  // Validate port is a number
  if (!/^\d+$/.test(portStr)) {
    throw new Error(`Invalid PORT: ${portStr}. Must be a valid port number.`);
  }
  
  const portNum = Number(portStr);
  if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
    throw new Error(`Invalid PORT: ${portStr}. Must be a valid port number.`);
  }

  return {
    mongodbUri: getMongoDbUri(),
    jwtSecret: getEnv('JWT_SECRET'),
    port: portNum,
    nodeEnv: getEnv('NODE_ENV'),
    corsOrigin: getEnv('CORS_ORIGIN'),
  };
};

export { getConfig, getMongoDbUri };
export type { Config };
