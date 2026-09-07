import { afterAll, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { setUpConnection, disconnect } from '../src/mongoose.js';

let testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/be-boilerplate-test';

beforeAll(async () => {
    await setUpConnection(testDbUri);
});

afterAll(async () => {
    await disconnect();
});
