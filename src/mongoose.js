import mongoose from 'mongoose';

import config from '../bin/config.json' with { type: 'json' };

// Export Schema for models that need it
const Schema = mongoose.Schema;

// Explicitly set strictQuery behavior (Mongoose 5 default: true)
mongoose.set('strictQuery', true);

import './models/Comment.js';
import './models/User.js';
import './models/Post.js';

const defaultUri = `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`;

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err.message}`);
});

const setUpConnection = async (uri) => {
  const connectionUri = uri || defaultUri;
  // Mongoose 6 rejects connect() on an active connection with a different
  // URI (Mongoose 5 tolerated it), so drop any stale connection first.
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  return mongoose.connect(connectionUri).catch((err) => {
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });
};

const disconnect = async () => {
  return mongoose.disconnect();
};

export { mongoose, Schema, setUpConnection, disconnect };
