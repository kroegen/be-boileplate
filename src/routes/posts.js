import express from 'express';
import { asyncHandler } from '../utils/errors.js';
import { list, create } from '../controllers/posts.js';

const posts = express.Router();

posts.get('/', asyncHandler(list));
posts.post('/', asyncHandler(create));

export default posts;
