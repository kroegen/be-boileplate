/* eslint-disable no-console */
import http from 'http';
import app from './app.js';
import { setUpConnection, disconnect } from './mongoose.js';
import { getConfig } from './config/index.js';

const config = getConfig();

const server = http.createServer(app);

app.set('port', config.port);

const startServer = async () => {
  try {
    await setUpConnection(config.mongodbUri);

    const listenPromise = new Promise((resolve, reject) => {
      server.listen(config.port, () => {
        console.info(`Server has started on port: ${config.port}`);
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
