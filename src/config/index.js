// Config module - validates and exports environment configuration
const getEnv = (key) => {
  const value = process.env[key];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getMongoDbUri = () => getEnv('MONGODB_URI');

const getConfig = () => {
  const config = {
    mongodbUri: getMongoDbUri(),
    jwtSecret: getEnv('JWT_SECRET'),
    port: getEnv('PORT'),
    nodeEnv: getEnv('NODE_ENV'),
    corsOrigin: getEnv('CORS_ORIGIN'),
  };

  // Validate port is a number
  const portNum = Number(config.port);
  if (!/^\d+$/.test(config.port) || !Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
    throw new Error(`Invalid PORT: ${config.port}. Must be a valid port number.`);
  }

  return { ...config, port: portNum };
};

export { getConfig, getMongoDbUri };
