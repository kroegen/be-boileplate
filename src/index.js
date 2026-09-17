/* eslint-disable no-console */
import http from 'http';
import app from './app.js';
import { setUpConnection, disconnect } from './mongoose.js';

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT', 'NODE_ENV', 'CORS_ORIGIN'];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:');
  missingVars.forEach((key) => console.error(`  ${key}`));
  console.error('Please copy .env.example to .env and configure the values.');
  process.exit(1);
}

const port = process.env.PORT || '3000';
const server = http.createServer(app);

app.set('port', port);

const startServer = async () => {
  try {
    await setUpConnection();

    const listenPromise = new Promise((resolve, reject) => {
      server.listen(port, () => {
        console.info(`Server has started on port: ${port}`);
        resolve();
      });
      server.on('error', (err) => {
        reject(err);
      });
    });

    await listenPromise;
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

const shutdown = async () => {
  console.info('Shutting down...');
  await disconnect();
  server.close(() => {
    console.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
