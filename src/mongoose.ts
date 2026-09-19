import mongoose, { Schema } from 'mongoose';

// Explicitly set strictQuery behavior (Mongoose 5 default: true)
mongoose.set('strictQuery', true);

import './models/Comment.js';
import './models/User.js';
import './models/Post.js';

const defaultUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/be-boilerplate';

mongoose.connection.on('error', (err: Error) => {
  console.error(`MongoDB connection error: ${err.message}`);
});

const setUpConnection = async (uri?: string): Promise<void> => {
  const connectionUri = uri || defaultUri;
  // Mongoose 6 rejects connect() on an active connection with a different
  // URI (Mongoose 5 tolerated it), so drop any stale connection first.
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(connectionUri).catch((err: Error) => {
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });
};

const disconnect = async (): Promise<void> => {
  return mongoose.disconnect();
};

export { mongoose, Schema, setUpConnection, disconnect };
