import express from 'express';
import { asyncHandler } from '#src/utils/errors.js';
import { authenticate } from '#src/utils/auth.js';
import { list, create } from '#src/controllers/posts.js';

const posts = express.Router();

posts.get('/', authenticate, asyncHandler(list));
posts.post('/', authenticate, asyncHandler(create));

export default posts;
