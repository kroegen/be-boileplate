import express from 'express';
import { asyncHandler } from '#src/utils/errors.js';
import { authenticate } from '#src/utils/auth.js';
import { list, create } from '#src/controllers/comments.js';

const comments = express.Router();

comments.get('/', authenticate, asyncHandler(list));
comments.post('/', authenticate, asyncHandler(create));

export default comments;
