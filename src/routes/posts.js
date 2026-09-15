import express from 'express';
import { asyncHandler } from '#src/utils/errors.js';
import { list, create } from '#src/controllers/posts.js';

const posts = express.Router();

posts.get('/', asyncHandler(list));
posts.post('/', asyncHandler(create));

export default posts;
