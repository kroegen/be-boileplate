import express from 'express';
import { asyncHandler } from '#src/utils/errors.js';
import { authenticate } from '#src/utils/auth.js';
import { list, create } from '#src/controllers/users.js';

const users = express.Router();

users.get('/', authenticate, asyncHandler(list));
users.post('/', authenticate, asyncHandler(create));

export default users;
